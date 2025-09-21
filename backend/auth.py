from flask import Blueprint, request, jsonify
from supabase import Client
from functools import wraps
from datetime import datetime
import jwt

auth_bp = Blueprint('auth', __name__)
supabase: Client = None

def init_auth(supabase_client: Client):
    global supabase
    supabase = supabase_client

# ----------------- Token Decorator -----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]

            # Decode JWT without verifying signature (development only)
            payload = jwt.decode(token, options={"verify_signature": False})
            request.user_id = payload.get('sub')
            if not request.user_id:
                return jsonify({'message': 'Token missing sub field'}), 401

        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401

        return f(*args, **kwargs)
    return decorated

# ----------------- Register -----------------

# ----------------- Register -----------------
@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user and create profile"""
    try:
        data = request.get_json()

        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name', '')
        user_type = data.get('user_type', 'citizen')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        # Corrected sign_up call using dictionary
        auth_response = supabase.auth.sign_up({
            'email': email,
            'password': password,
            'options': {
                'data': {
                    'full_name': full_name,
                    'user_type': user_type
                }
            }
        })

        if auth_response.user:
            # Create profile in 'profiles' table
            profile_data = {
                'id': auth_response.user.id,
                'email': email,
                'full_name': full_name,
                'user_type': user_type,
                'created_at': datetime.utcnow().isoformat()
            }

            supabase.table('profiles').insert(profile_data).execute()

            return jsonify({
                'message': 'User registered successfully',
                'user': profile_data
            }), 201
        else:
            return jsonify({
                'message': 'Registration failed',
                'error': getattr(auth_response, 'message', str(auth_response))
            }), 400

    except Exception as e:
        # It's good practice to log the error to a file or logging service in production
        # For example: current_app.logger.error(f"Registration error: {e}")
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

# ----------------- Login -----------------
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        auth_response = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password
        })

        if auth_response.user and auth_response.session:
            profile_response = supabase.table('profiles').select('*').eq('id', auth_response.user.id).execute()
            profile = profile_response.data[0] if profile_response.data else {}

            return jsonify({
                'message': 'Login successful',
                'user': profile,
                'access_token': auth_response.session.access_token,
                'refresh_token': auth_response.session.refresh_token
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

# ----------------- Logout -----------------
@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Supabase handles logout client-side
    return jsonify({'message': 'Logout successful'}), 200

# ----------------- Get Profile -----------------
@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    try:
        user_id = request.user_id
        profile_response = supabase.table('profiles').select('*').eq('id', user_id).execute()

        if profile_response.data:
            return jsonify({'user': profile_response.data[0]}), 200
        return jsonify({'message': 'Profile not found'}), 404

    except Exception as e:
        return jsonify({'message': 'Failed to get profile', 'error': str(e)}), 500

# ----------------- Update Profile -----------------
@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    try:
        user_id = request.user_id
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        update_data = {}
        if 'full_name' in data:
            update_data['full_name'] = data['full_name']
        if 'user_type' in data:
            update_data['user_type'] = data['user_type']

        if update_data:
            supabase.table('profiles').update(update_data).eq('id', user_id).execute()
            return jsonify({'message': 'Profile updated', 'user': update_data}), 200
        else:
            return jsonify({'message': 'No valid fields to update'}), 400

    except Exception as e:
        return jsonify({'message': 'Failed to update profile', 'error': str(e)}), 500

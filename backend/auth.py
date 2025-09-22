from flask import Blueprint, request, jsonify
from supabase import Client
from functools import wraps
from datetime import datetime

auth_bp = Blueprint('auth', __name__)
supabase: Client = None

def init_auth(supabase_client: Client):
    global supabase
    supabase = supabase_client

# ----------------- Token Decorator -----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)

        token = None
        if 'Authorization' in request.headers and request.headers['Authorization'].startswith('Bearer '):
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            user_response = supabase.auth.get_user(token)
            user = user_response.user
            if not user:
                return jsonify({'message': 'User not found for this token'}), 401
            
            # Attach user_id to the request for endpoint functions to use
            request.user_id = user.id
            if not request.user_id:
                return jsonify({'message': 'Token is valid but user ID is missing'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401

        return f(*args, **kwargs)
    return decorated

# ----------------- Register -----------------
@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user, create a profile, and return a session."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name', '')
        user_type = data.get('user_type', 'citizen')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

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

        # --- FIX: Check for both user and session objects ---
        if auth_response.user and auth_response.session:
            profile_data = {
                'id': auth_response.user.id,
                'email': email,
                'full_name': full_name,
                'role': user_type,
            }
            supabase.table('users').insert(profile_data).execute()

            # --- FIX: Return session tokens for automatic login on the frontend ---
            return jsonify({
                'message': 'User registered successfully',
                'user': profile_data,
                'access_token': auth_response.session.access_token,
                'refresh_token': auth_response.session.refresh_token
            }), 201
        else:
            error_message = getattr(auth_response, 'message', str(auth_response))
            # Handle cases where user might already exist
            if "User already registered" in str(error_message):
                 return jsonify({'message': 'An account with this email already exists.'}), 409
            return jsonify({'message': 'Registration failed', 'error': error_message}), 400

    except Exception as e:
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
    # Supabase handles logout client-side by clearing tokens.
    # This endpoint is mostly for completeness.
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
        
        # Note: Do not allow changing user_type via a simple profile update for security.
        # This should be a separate, admin-only process.

        if update_data:
            supabase.table('profiles').update(update_data).eq('id', user_id).execute()
            return jsonify({'message': 'Profile updated', 'user': update_data}), 200
        else:
            return jsonify({'message': 'No valid fields to update'}), 400

    except Exception as e:
        return jsonify({'message': 'Failed to update profile', 'error': str(e)}), 500

from flask import Blueprint, request, jsonify
from supabase import Client
import uuid
from datetime import datetime
from auth import token_required

issues_bp = Blueprint('issues', __name__)
supabase: Client = None

def init_issues(supabase_client):
    global supabase
    supabase = supabase_client

@issues_bp.route('/issues', methods=['POST'])
@token_required
def report_issue():
    """Report a new issue"""
    try:
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]

        user = supabase.auth.get_user(token)
        data = request.get_json()

        if not user or not data:
            return jsonify({'message': 'Invalid request'}), 400

        # Validate required fields
        required_fields = ['title', 'description', 'category', 'location']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field} is required'}), 400

        issue_data = {
            'id': str(uuid.uuid4()),
            'user_id': user.user.id,
            'title': data['title'],
            'description': data['description'],
            'category': data['category'],
            'location': data['location'],
            'priority': data.get('priority', 'medium'),
            'status': 'reported',
            'image_url': data.get('image_url', ''),
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        # Insert issue into database
        result = supabase.table('issues').insert(issue_data).execute()

        return jsonify({
            'message': 'Issue reported successfully',
            'issue': result.data[0]
        }), 201

    except Exception as e:
        return jsonify({'message': 'Failed to report issue', 'error': str(e)}), 500

@issues_bp.route('/issues', methods=['GET'])
@token_required
def get_issues():
    """Get all issues for the logged-in user"""
    try:
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]

        user = supabase.auth.get_user(token)

        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Get user profile to check user type
        profile_response = supabase.table('profiles').select('user_type').eq('id', user.user.id).execute()

        if not profile_response.data:
            return jsonify({'message': 'User profile not found'}), 404

        user_type = profile_response.data[0]['user_type']

        # If government user, get all issues; if citizen, get only their issues
        if user_type == 'government':
            query = supabase.table('issues').select('*').order('created_at', desc=True)
        else:
            query = supabase.table('issues').select('*').eq('user_id', user.user.id).order('created_at', desc=True)

        # Apply filters if provided
        category = request.args.get('category')
        status = request.args.get('status')
        priority = request.args.get('priority')

        if category:
            query = query.eq('category', category)
        if status:
            query = query.eq('status', status)
        if priority:
            query = query.eq('priority', priority)

        result = query.execute()

        return jsonify({
            'issues': result.data,
            'total': len(result.data)
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to get issues', 'error': str(e)}), 500

@issues_bp.route('/issues/<issue_id>', methods=['GET'])
@token_required
def get_issue(issue_id):
    """Get a specific issue by ID"""
    try:
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]

        user = supabase.auth.get_user(token)

        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Get issue with user profile information
        result = supabase.table('issues').select('*, profiles(full_name, email)').eq('id', issue_id).execute()

        if not result.data:
            return jsonify({'message': 'Issue not found'}), 404

        issue = result.data[0]

        # Check if user can access this issue (own issue or government user)
        profile_response = supabase.table('profiles').select('user_type').eq('id', user.user.id).execute()

        if profile_response.data[0]['user_type'] != 'government' and issue['user_id'] != user.user.id:
            return jsonify({'message': 'Access denied'}), 403

        return jsonify({'issue': issue}), 200

    except Exception as e:
        return jsonify({'message': 'Failed to get issue', 'error': str(e)}), 500

@issues_bp.route('/issues/<issue_id>', methods=['PUT'])
@token_required
def update_issue(issue_id):
    """Update an issue (status, priority, etc.)"""
    try:
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]

        user = supabase.auth.get_user(token)

        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Check if user is government official
        profile_response = supabase.table('profiles').select('user_type').eq('id', user.user.id).execute()

        if not profile_response.data or profile_response.data[0]['user_type'] != 'government':
            return jsonify({'message': 'Only government officials can update issues'}), 403

        data = request.get_json()

        if not data:
            return jsonify({'message': 'No data provided'}), 400

        # Get current issue
        current_issue = supabase.table('issues').select('*').eq('id', issue_id).execute()

        if not current_issue.data:
            return jsonify({'message': 'Issue not found'}), 404

        # Prepare update data
        update_data = {
            'updated_at': datetime.utcnow().isoformat()
        }

        allowed_fields = ['status', 'priority', 'assigned_to', 'notes']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        # Update issue
        result = supabase.table('issues').update(update_data).eq('id', issue_id).execute()

        return jsonify({
            'message': 'Issue updated successfully',
            'issue': result.data[0]
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to update issue', 'error': str(e)}), 500

@issues_bp.route('/issues/<issue_id>/comments', methods=['POST'])
@token_required
def add_comment(issue_id):
    """Add a comment to an issue"""
    try:
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]

        user = supabase.auth.get_user(token)
        data = request.get_json()

        if not user or not data or not data.get('comment'):
            return jsonify({'message': 'Comment is required'}), 400

        comment_data = {
            'id': str(uuid.uuid4()),
            'issue_id': issue_id,
            'user_id': user.user.id,
            'comment': data['comment'],
            'created_at': datetime.utcnow().isoformat()
        }

        # Insert comment
        result = supabase.table('issue_comments').insert(comment_data).execute()

        return jsonify({
            'message': 'Comment added successfully',
            'comment': result.data[0]
        }), 201

    except Exception as e:
        return jsonify({'message': 'Failed to add comment', 'error': str(e)}), 500

@issues_bp.route('/issues/<issue_id>/comments', methods=['GET'])
@token_required
def get_comments(issue_id):
    """Get all comments for an issue"""
    try:
        result = supabase.table('issue_comments').select('*, profiles(full_name)').eq('issue_id', issue_id).order('created_at', desc=True).execute()

        return jsonify({
            'comments': result.data,
            'total': len(result.data)
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to get comments', 'error': str(e)}), 500

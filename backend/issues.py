from flask import Blueprint, request, jsonify
from supabase import Client
from datetime import datetime
from auth import token_required

issues_bp = Blueprint('issues', __name__)
supabase: Client = None

def init_issues(supabase_client):
    global supabase
    supabase = supabase_client

# --- CHANGE: Route updated to '/' since '/api/issues' is the blueprint prefix ---
@issues_bp.route('/', methods=['POST'])
@token_required
def report_issue():
    """Report a new issue"""
    try:
        # --- CHANGE: Use user_id and token from the decorator and headers ---
        user_id = request.user_id
        token = request.headers.get('Authorization').split(" ")[1]
        data = request.get_json()

        if not data:
            return jsonify({'message': 'Invalid request body'}), 400

        # --- CHANGE: Updated validation for 'location_text' and cleaned data ---
        required_fields = ['title', 'description', 'category', 'location_text']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field} is required'}), 400

        issue_data = {
            'user_id': user_id,
            'title': data['title'].strip(),
            'description': data['description'].strip(),
            'category': data['category'].strip().lower(),
            'location_text': data['location_text'].strip(),
            'priority': data.get('priority', 'medium').strip().lower(),
            'status': 'reported',  # Set initial status consistently
            'image_url': data.get('image_url', []), # Default to empty array
            'is_anonymous': data.get('is_anonymous', False),
            'language': data.get('language', 'english'),
            # --- REMOVED: Let the database handle id, created_at, and updated_at ---
        }

        # --- CHANGE: Switch to user's token to enforce RLS INSERT policies ---
        original_auth = supabase.postgrest.auth
        try:
            supabase.postgrest.auth(token)
            # Insert issue into database
            result = supabase.table('issues').insert(issue_data).execute()
        finally:
            # Restore the service role key for other operations
            supabase.postgrest.auth(original_auth)

        if not result.data:
            raise Exception("Failed to insert issue. Check RLS policies.")

        return jsonify({
            'message': 'Issue reported successfully',
            'issue': result.data[0]
        }), 201

    except Exception as e:
        print(f"ERROR in report_issue: {e}")
        return jsonify({'message': 'Failed to report issue', 'error': str(e)}), 500


# --- CHANGE: Route updated to '/' ---
@issues_bp.route('/', methods=['GET'])
@token_required
def get_issues():
    """Get issues based on user role (citizen vs government)"""
    try:
        user_id = request.user_id
        token = request.headers.get('Authorization').split(" ")[1]

        # --- CHANGE: Switch to user's token to enforce RLS for all queries ---
        # This is more secure than python-based logic, as it relies on database security.
        original_auth = supabase.postgrest.auth
        try:
            supabase.postgrest.auth(token)
            
            # RLS will now automatically filter for the user.
            # A government user's policy can allow SELECT *, while a citizen's is `user_id = auth.uid()`
            query = supabase.table('issues').select('*').order('created_at', desc=True)

            # Apply filters if provided
            if request.args.get('category'):
                query = query.eq('category', request.args.get('category'))
            if request.args.get('status'):
                query = query.eq('status', request.args.get('status'))
            if request.args.get('priority'):
                query = query.eq('priority', request.args.get('priority'))

            result = query.execute()

        finally:
            supabase.postgrest.auth(original_auth)
        
        return jsonify({
            'issues': result.data,
            'total': len(result.data)
        }), 200

    except Exception as e:
        print(f"ERROR in get_issues: {e}")
        return jsonify({'message': 'Failed to get issues', 'error': str(e)}), 500


@issues_bp.route('/<int:issue_id>', methods=['GET'])
@token_required
def get_issue(issue_id):
    """Get a specific issue by ID"""
    try:
        user_id = request.user_id
        token = request.headers.get('Authorization').split(" ")[1]

        # --- CHANGE: Switch to user's token to enforce RLS for security ---
        original_auth = supabase.postgrest.auth
        try:
            supabase.postgrest.auth(token)
            # This query will only return data if the user is allowed to see it by RLS.
            result = supabase.table('issues').select('*, profiles(full_name, email)').eq('id', issue_id).single().execute()
        finally:
            supabase.postgrest.auth(original_auth)

        if not result.data:
            return jsonify({'message': 'Issue not found or access denied'}), 404

        return jsonify({'issue': result.data}), 200

    except Exception as e:
        print(f"ERROR in get_issue: {e}")
        return jsonify({'message': 'Failed to get issue', 'error': str(e)}), 500


@issues_bp.route('/<int:issue_id>', methods=['PUT'])
@token_required
def update_issue(issue_id):
    """Update an issue (status, priority, etc.) - FOR GOVERNMENT ONLY"""
    try:
        user_id = request.user_id
        
        # --- CHANGE: Use service key for admin checks and actions ---
        # 1. Verify user is a government official
        profile_response = supabase.table('profiles').select('user_type').eq('id', user_id).single().execute()

        if not profile_response.data or profile_response.data.get('user_type') != 'government':
            return jsonify({'message': 'Access denied. Only government officials can update issues.'}), 403

        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        update_data = {
            'updated_at': datetime.utcnow().isoformat()
        }

        # --- CHANGE: Clean any incoming data before updating ---
        allowed_fields = ['status', 'priority', 'assigned_to', 'notes']
        for field in allowed_fields:
            if field in data:
                # Clean the data before adding it to the update payload
                update_data[field] = data[field].strip() if isinstance(data[field], str) else data[field]

        if len(update_data) == 1: # Only updated_at is present
             return jsonify({'message': 'No valid fields to update'}), 400

        # 2. Perform the update using the service key's privileges
        result = supabase.table('issues').update(update_data).eq('id', issue_id).execute()

        if not result.data:
            return jsonify({'message': 'Issue not found'}), 404

        return jsonify({
            'message': 'Issue updated successfully',
            'issue': result.data[0]
        }), 200

    except Exception as e:
        print(f"ERROR in update_issue: {e}")
        return jsonify({'message': 'Failed to update issue', 'error': str(e)}), 500


@issues_bp.route('/<int:issue_id>/comments', methods=['POST'])
@token_required
def add_comment(issue_id):
    """Add a comment to an issue"""
    try:
        user_id = request.user_id
        token = request.headers.get('Authorization').split(" ")[1]
        data = request.get_json()

        if not data or not data.get('comment'):
            return jsonify({'message': 'Comment text is required'}), 400

        comment_data = {
            'issue_id': issue_id,
            'user_id': user_id,
            'comment': data['comment'].strip(),
            # --- REMOVED: Let database handle id and created_at ---
        }
        
        # --- CHANGE: Use user's token to enforce RLS for comment insertion ---
        original_auth = supabase.postgrest.auth
        try:
            supabase.postgrest.auth(token)
            result = supabase.table('issue_comments').insert(comment_data).execute()
        finally:
            supabase.postgrest.auth(original_auth)

        if not result.data:
            raise Exception("Failed to add comment. Check RLS policies.")

        return jsonify({
            'message': 'Comment added successfully',
            'comment': result.data[0]
        }), 201

    except Exception as e:
        print(f"ERROR in add_comment: {e}")
        return jsonify({'message': 'Failed to add comment', 'error': str(e)}), 500


@issues_bp.route('/<int:issue_id>/comments', methods=['GET'])
@token_required
def get_comments(issue_id):
    """Get all comments for an issue"""
    try:
        # It's good practice to enforce RLS here too.
        token = request.headers.get('Authorization').split(" ")[1]
        original_auth = supabase.postgrest.auth
        try:
            supabase.postgrest.auth(token)
            # This ensures a user can only get comments for an issue they are allowed to see.
            result = supabase.table('issue_comments').select('*, profiles(full_name)').eq('issue_id', issue_id).order('created_at', desc=True).execute()
        finally:
            supabase.postgrest.auth(original_auth)

        return jsonify({
            'comments': result.data,
            'total': len(result.data)
        }), 200

    except Exception as e:
        print(f"ERROR in get_comments: {e}")
        return jsonify({'message': 'Failed to get comments', 'error': str(e)}), 500


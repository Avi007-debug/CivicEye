from flask import Blueprint, request, jsonify
from supabase import Client
import os
from auth import token_required

dashboard_bp = Blueprint('dashboard', __name__)
supabase: Client = None

def init_dashboard(supabase_client):
    global supabase
    supabase = supabase_client

# ------------------ CITIZEN DASHBOARD ------------------ #
@dashboard_bp.route('/citizen', methods=['GET'])
@token_required
def citizen_dashboard():
    """Get citizen dashboard data using user_id from token."""
    try:
        # Get the user's token from the Authorization header
        token = request.headers.get('Authorization').split(' ')[1]
        user_id = request.user_id

        # Temporarily override auth to use the user's JWT for this request.
        # This ensures that Supabase RLS policies are correctly applied.
        original_auth = supabase.postgrest.auth
        try:
            supabase.postgrest.auth(token)

            # Fetch all issues for this user
            user_issues_response = supabase.table('issues')\
                .select('status, category', count='exact')\
                .eq('user_id', user_id)\
                .execute()

            user_issues_data = getattr(user_issues_response, 'data', [])
            total_issues = user_issues_response.count if hasattr(user_issues_response, 'count') else len(user_issues_data)

            # --- CHANGE: Clean status data before counting ---
            resolved_issues = sum(1 for i in user_issues_data if i.get('status', '').strip().lower() == 'resolved')
            in_progress_issues = sum(1 for i in user_issues_data if i.get('status', '').strip().lower() == 'in_progress')
            pending_issues = sum(1 for i in user_issues_data if i.get('status', '').strip().lower() == 'reported')
            # --- END CHANGE ---

            # Recent issues (latest 5)
            recent_issues_resp = supabase.table('issues') \
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .limit(5)\
                .execute()
            recent_issues = recent_issues_resp.data or []

            # Category breakdown (dynamic)
            category_stats = {}
            for issue in user_issues_data or []:
                category = issue.get('category') or 'others'
                category_stats[category] = category_stats.get(category, 0) + 1

            return jsonify({
                'statistics': {
                    'total_issues': total_issues,
                    'resolved_issues': resolved_issues,
                    'in_progress_issues': in_progress_issues,
                    'pending_issues': pending_issues,
                    'resolution_rate': (resolved_issues / total_issues * 100) if total_issues > 0 else 0
                },
                'recent_issues': recent_issues,
                'category_breakdown': category_stats
            }), 200
        finally:
            # Always restore the original auth context
            supabase.postgrest.auth(original_auth)

    except Exception as e:
        print(f"ERROR in citizen_dashboard: {e}")
        return jsonify({'message': 'Failed to get dashboard data', 'error': str(e)}), 500

# ------------------ GOVERNMENT DASHBOARD ------------------ #
@dashboard_bp.route('/government', methods=['GET'])
@token_required
def government_dashboard():
    """Get government dashboard data"""
    try:
        user_id = request.user_id
        
        original_auth = supabase.postgrest.auth
        service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

        if not service_key:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not set in the environment.")

        try:
            supabase.postgrest.auth(service_key)

            # 1. Perform user type check
            profile_resp = supabase.table('profiles')\
                .select('user_type')\
                .eq('id', user_id)\
                .single()\
                .execute()

            profile_data = getattr(profile_resp, 'data', {})
            if not profile_data or profile_data.get('user_type') != 'government':
                return jsonify({'message': 'Access denied. Government access required.'}), 403

            # 2. Fetch all issue data for stats
            all_issues_resp = supabase.table('issues')\
                .select('status, priority, category', count='exact')\
                .execute()
            
            all_issues_data = getattr(all_issues_resp, 'data', [])
            total_issues = all_issues_resp.count if hasattr(all_issues_resp, 'count') else 0

            # --- CHANGE: Clean status data before counting ---
            resolved_issues = sum(1 for i in all_issues_data if i.get('status', '').strip().lower() == 'resolved')
            in_progress_issues = sum(1 for i in all_issues_data if i.get('status', '').strip().lower() == 'in_progress')
            pending_issues = sum(1 for i in all_issues_data if i.get('status', '').strip().lower() == 'reported')
            urgent_issues = sum(1 for i in all_issues_data if i.get('priority', '').strip().lower() == 'high')
            # --- END CHANGE ---

            category_stats = {}
            status_stats = {'reported': 0, 'in_progress': 0, 'resolved': 0, 'verified': 0}

            for issue in all_issues_data:
                category = issue.get('category') or 'others'
                category_stats[category] = category_stats.get(category, 0) + 1

                # --- CHANGE: Clean status before dictionary lookup ---
                status = issue.get('status', '').strip().lower()
                if status in status_stats:
                    status_stats[status] += 1
                # --- END CHANGE ---

            # 4. Fetch recent issues for the list view
            recent_issues_resp = supabase.table('issues')\
                .select('*')\
                .order('created_at', desc=True)\
                .limit(10)\
                .execute()
            recent_issues = recent_issues_resp.data or []

            # 5. Return the COMPLETE data structure
            return jsonify({
                'statistics': {
                    'total_issues': total_issues,
                    'resolved_issues': resolved_issues,
                    'in_progress_issues': in_progress_issues,
                    'pending_issues': pending_issues,
                    'urgent_issues': urgent_issues,
                    'resolution_rate': (resolved_issues / total_issues * 100) if total_issues > 0 else 0
                },
                'recent_issues': recent_issues,
                'category_breakdown': category_stats,
                'status_breakdown': status_stats
            }), 200

        finally:
            supabase.postgrest.auth(original_auth)

    except Exception as e:
        print(f"ERROR in government_dashboard: {e}")
        return jsonify({'message': 'Failed to get government dashboard data', 'error': str(e)}), 500

from flask import Blueprint, request, jsonify
from supabase import Client
from auth import token_required
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)
supabase: Client = None

def init_dashboard(supabase_client):
    global supabase
    supabase = supabase_client

@dashboard_bp.route('/citizen', methods=['GET'])
@token_required
def citizen_dashboard():
    """Get citizen dashboard data using user_id from token."""
    try:
        user_id = request.user_id
        
        # This query correctly uses the 'user_id' column
        user_issues_response = supabase.table('issues').select('*', count='exact').eq('user_id', user_id).execute()

        # Check for errors from the Supabase query itself
        if hasattr(user_issues_response, 'error') and user_issues_response.error:
            raise Exception(f"Supabase error: {user_issues_response.error.message}")

        user_issues_data = user_issues_response.data
        total_issues = user_issues_response.count

        # Calculate statistics
        resolved_issues = len([i for i in user_issues_data if i['status'] == 'resolved'])
        in_progress_issues = len([i for i in user_issues_data if i['status'] == 'in_progress'])
        pending_issues = len([i for i in user_issues_data if i['status'] == 'reported'])

        # This query also correctly uses 'user_id'
        recent_issues = supabase.table('issues').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(5).execute()

        # Get category breakdown
        category_stats = {}
        for issue in user_issues_data:
            category = issue.get('category') 
            if category:
                category_stats[category] = category_stats.get(category, 0) + 1

        return jsonify({
            'statistics': {
                'total_issues': total_issues,
                'resolved_issues': resolved_issues,
                'in_progress_issues': in_progress_issues,
                'pending_issues': pending_issues,
                'resolution_rate': (resolved_issues / total_issues * 100) if total_issues > 0 else 0
            },
            'recent_issues': recent_issues.data,
            'category_breakdown': category_stats
        }), 200

    except Exception as e:
        print(f"ERROR in citizen_dashboard: {e}")
        return jsonify({'message': 'Failed to get dashboard data', 'error': str(e)}), 500

@dashboard_bp.route('/government', methods=['GET'])
@token_required
def government_dashboard():
    """Get government dashboard data"""
    try:
        user_id = request.user_id

        profile_response = supabase.table('profiles').select('user_type').eq('id', user_id).single().execute()

        if not profile_response.data or profile_response.data.get('user_type') != 'government':
            return jsonify({'message': 'Access denied. Government access required.'}), 403

        all_issues_response = supabase.table('issues').select('*', count='exact').execute()
        
        if hasattr(all_issues_response, 'error') and all_issues_response.error:
            raise Exception(f"Supabase error fetching all issues: {all_issues_response.error.message}")

        all_issues_data = all_issues_response.data
        total_issues = all_issues_response.count
        
        resolved_issues = len([i for i in all_issues_data if i['status'] == 'resolved'])
        in_progress_issues = len([i for i in all_issues_data if i['status'] == 'in_progress'])
        pending_issues = len([i for i in all_issues_data if i['status'] == 'reported'])
        urgent_issues = len([i for i in all_issues_data if i['priority'] == 'high'])

        # --- FIX: Explicitly tell Supabase to join 'profiles' on the 'user_id' foreign key ---
        recent_issues_response = supabase.table('issues').select('*, profiles!user_id(full_name)').order('created_at', desc=True).limit(10).execute()
        
        if hasattr(recent_issues_response, 'error') and recent_issues_response.error:
             raise Exception(f"Supabase error fetching recent issues: {recent_issues_response.error.message}")

        # Calculate breakdowns
        category_stats = {}
        priority_stats = {'high': 0, 'medium': 0, 'low': 0}
        status_stats = {'reported': 0, 'in_progress': 0, 'resolved': 0, 'verified': 0}

        for issue in all_issues_data:
            category = issue.get('category')
            if category:
                category_stats[category] = category_stats.get(category, 0) + 1
            
            priority = issue.get('priority')
            if priority in priority_stats:
                priority_stats[priority] += 1
            
            status = issue.get('status')
            if status in status_stats:
                status_stats[status] += 1

        return jsonify({
            'statistics': {
                'total_issues': total_issues,
                'resolved_issues': resolved_issues,
                'in_progress_issues': in_progress_issues,
                'pending_issues': pending_issues,
                'urgent_issues': urgent_issues,
                'resolution_rate': (resolved_issues / total_issues * 100) if total_issues > 0 else 0
            },
            'recent_issues': recent_issues_response.data,
            'category_breakdown': category_stats,
            'priority_breakdown': priority_stats,
            'status_breakdown': status_stats,
        }), 200

    except Exception as e:
        print(f"ERROR in government_dashboard: {e}")
        return jsonify({'message': 'Failed to get government dashboard data', 'error': str(e)}), 500


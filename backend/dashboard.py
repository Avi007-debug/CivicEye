from flask import Blueprint, request, jsonify
from supabase import Client
from auth import token_required
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)
supabase: Client = None

def init_dashboard(supabase_client):
    global supabase
    supabase = supabase_client

@dashboard_bp.route('/dashboard/citizen', methods=['GET'])
@token_required
def citizen_dashboard():
    """Get citizen dashboard data"""
    try:
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]

        user = supabase.auth.get_user(token)

        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Get user's issues statistics
        user_issues = supabase.table('issues').select('*').eq('user_id', user.user.id).execute()

        # Calculate statistics
        total_issues = len(user_issues.data)
        resolved_issues = len([i for i in user_issues.data if i['status'] == 'resolved'])
        in_progress_issues = len([i for i in user_issues.data if i['status'] == 'in_progress'])
        pending_issues = len([i for i in user_issues.data if i['status'] == 'reported'])

        # Get recent issues (last 5)
        recent_issues = supabase.table('issues').select('*').eq('user_id', user.user.id).order('created_at', desc=True).limit(5).execute()

        # Get category breakdown
        category_stats = {}
        for issue in user_issues.data:
            category = issue['category']
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
        return jsonify({'message': 'Failed to get dashboard data', 'error': str(e)}), 500

@dashboard_bp.route('/dashboard/government', methods=['GET'])
@token_required
def government_dashboard():
    """Get government dashboard data"""
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
            return jsonify({'message': 'Access denied. Government access required.'}), 403

        # Get all issues statistics
        all_issues = supabase.table('issues').select('*').execute()

        # Calculate statistics
        total_issues = len(all_issues.data)
        resolved_issues = len([i for i in all_issues.data if i['status'] == 'resolved'])
        in_progress_issues = len([i for i in all_issues.data if i['status'] == 'in_progress'])
        pending_issues = len([i for i in all_issues.data if i['status'] == 'reported'])
        urgent_issues = len([i for i in all_issues.data if i['priority'] == 'high'])

        # Get recent issues (last 10)
        recent_issues = supabase.table('issues').select('*, profiles(full_name)').order('created_at', desc=True).limit(10).execute()

        # Get category breakdown
        category_stats = {}
        priority_stats = {'high': 0, 'medium': 0, 'low': 0}
        status_stats = {'reported': 0, 'in_progress': 0, 'resolved': 0}

        for issue in all_issues.data:
            category = issue['category']
            category_stats[category] = category_stats.get(category, 0) + 1

            priority_stats[issue['priority']] = priority_stats.get(issue['priority'], 0) + 1
            status_stats[issue['status']] = status_stats.get(issue['status'], 0) + 1

        # Get issues by location (top 5 locations)
        location_stats = {}
        for issue in all_issues.data:
            location = issue['location']
            location_stats[location] = location_stats.get(location, 0) + 1

        top_locations = sorted(location_stats.items(), key=lambda x: x[1], reverse=True)[:5]

        return jsonify({
            'statistics': {
                'total_issues': total_issues,
                'resolved_issues': resolved_issues,
                'in_progress_issues': in_progress_issues,
                'pending_issues': pending_issues,
                'urgent_issues': urgent_issues,
                'resolution_rate': (resolved_issues / total_issues * 100) if total_issues > 0 else 0,
                'average_resolution_time': calculate_average_resolution_time(all_issues.data)
            },
            'recent_issues': recent_issues.data,
            'category_breakdown': category_stats,
            'priority_breakdown': priority_stats,
            'status_breakdown': status_stats,
            'top_locations': top_locations
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to get dashboard data', 'error': str(e)}), 500

@dashboard_bp.route('/dashboard/analytics', methods=['GET'])
@token_required
def get_analytics():
    """Get detailed analytics data"""
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
            return jsonify({'message': 'Access denied. Government access required.'}), 403

        # Get date range (default last 30 days)
        days = int(request.args.get('days', 30))
        start_date = datetime.utcnow() - timedelta(days=days)

        # Get issues created in the date range
        issues_response = supabase.table('issues').select('*').gte('created_at', start_date.isoformat()).execute()

        # Calculate daily statistics
        daily_stats = {}
        for issue in issues_response.data:
            date = issue['created_at'][:10]  # Get YYYY-MM-DD
            if date not in daily_stats:
                daily_stats[date] = {'total': 0, 'resolved': 0, 'reported': 0}
            daily_stats[date]['total'] += 1
            daily_stats[date][issue['status']] += 1

        # Get monthly trends
        monthly_stats = {}
        for issue in issues_response.data:
            month = issue['created_at'][:7]  # Get YYYY-MM
            if month not in monthly_stats:
                monthly_stats[month] = {'total': 0, 'resolved': 0, 'reported': 0}
            monthly_stats[month]['total'] += 1
            monthly_stats[month][issue['status']] += 1

        return jsonify({
            'daily_stats': daily_stats,
            'monthly_stats': monthly_stats,
            'period_days': days,
            'total_issues_in_period': len(issues_response.data)
        }), 200

    except Exception as e:
        return jsonify({'message': 'Failed to get analytics data', 'error': str(e)}), 500

def calculate_average_resolution_time(issues):
    """Calculate average resolution time for resolved issues"""
    resolved_issues = [i for i in issues if i['status'] == 'resolved']

    if not resolved_issues:
        return 0

    total_time = 0
    for issue in resolved_issues:
        try:
            created_at = datetime.fromisoformat(issue['created_at'].replace('Z', '+00:00'))
            # For demo purposes, assume resolution time is 3-7 days
            # In real implementation, you'd have a resolved_at timestamp
            resolution_time = 5  # days
            total_time += resolution_time
        except:
            continue

    return total_time / len(resolved_issues) if resolved_issues else 0

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from functools import wraps
from dotenv import load_dotenv
import logging

# Import blueprints
from auth import auth_bp, init_auth
from issues import issues_bp, init_issues
from dashboard import dashboard_bp, init_dashboard

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for development

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL')
# --- FIX: Use the Service Role Key on the backend for admin-level operations ---
# The service key can bypass Row Level Security (RLS), so it's crucial that your
# API endpoints always verify user permissions before performing any action.
# The anon key is meant for client-side (browser) usage.
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not supabase_key:
    logger.error("Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)")
    raise ValueError("Missing Supabase environment variables")

from supabase import create_client, Client
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize blueprint modules with Supabase client
init_auth(supabase)
init_issues(supabase)
init_dashboard(supabase)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(issues_bp, url_prefix='/api/issues')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'CivicEye Backend API is running'
    })

@app.route('/api/test-db', methods=['GET'])
def test_database():
    """Test database connection"""
    try:
        # Test Supabase connection
        response = supabase.table('profiles').select('*').limit(1).execute()
        return jsonify({
            'status': 'success',
            'message': 'Database connection successful'
        })
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Database connection failed: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.getenv('PORT', 5000))

    # Print startup information
    logger.info("="*50)
    logger.info("🚀 Starting CivicEye Backend API...")
    logger.info(f"🔗 SUPABASE_URL: {os.getenv('SUPABASE_URL')}")
    logger.info(f"🔑 SUPABASE_KEY: {'SET' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else 'NOT SET'}")
    logger.info(f"📍 Server will be available at: http://localhost:{port}")
    logger.info(f"🏥 Health check: http://localhost:{port}/health")
    logger.info("📚 API Documentation: Check backend/README.md for all endpoints")
    logger.info("="*50)

    app.run(
        debug=os.getenv('FLASK_ENV') == 'development',
        host='0.0.0.0',
        port=port
    )

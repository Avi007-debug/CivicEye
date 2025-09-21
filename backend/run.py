#!/usr/bin/env python3
"""
Startup script for CivicEye Backend
"""

import os
import sys
from dotenv import load_dotenv

def main():
    """Main function to run the Flask application"""

    # Load environment variables
    load_dotenv()
    print("SUPABASE_URL:", os.getenv("SUPABASE_URL"))
    print("SUPABASE_ANON_KEY:", "SET" if os.getenv("SUPABASE_ANON_KEY") else "NOT SET")


    # Add current directory to Python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)

    # Import and run the Flask app
    from app import app

    # Get port from environment or use default
    port = int(os.getenv('PORT', 5000))

    print("🚀 Starting CivicEye Backend API...")
    print(f"📍 Server will be available at: http://localhost:{port}")
    print(f"🏥 Health check: http://localhost:{port}/health")
    print("📚 API Documentation: Check backend/README.md for all endpoints")
    print("\n" + "="*50)

    # Run the application
    app.run(
        debug=os.getenv('FLASK_ENV') == 'development',
        host='0.0.0.0',
        port=port
    )

if __name__ == '__main__':
    main()

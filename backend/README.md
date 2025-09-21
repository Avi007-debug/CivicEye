# CivicEye Backend API

A Flask-based REST API for the CivicEye civic engagement platform, integrated with Supabase for authentication and database management.

## Features

- **User Authentication**: Register, login, logout, and profile management
- **Issue Management**: Report, track, and manage civic issues
- **Dashboard Analytics**: Comprehensive dashboards for citizens and government officials
- **Role-based Access**: Different permissions for citizens and government users
- **Real-time Data**: Integration with Supabase for real-time updates

## Tech Stack

- **Framework**: Flask 3.0.0
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **CORS**: Flask-CORS for cross-origin requests
- **Environment**: Python 3.8+

## Setup Instructions

### 1. Environment Setup

1. Navigate to the backend directory:
   ```bash
   cd CivicEye/backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### 2. Supabase Configuration

1. Create a new project on [Supabase](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SECRET_KEY=your_secret_key_here
   ```

### 3. Database Setup

Create the following tables in your Supabase database:

#### Profiles Table
```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    user_type TEXT DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow insert for authenticated users
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Issues Table
```sql
CREATE TABLE issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'reported',
    image_url TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    assigned_to UUID REFERENCES auth.users,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Policy for citizens to view only their own issues
CREATE POLICY "Users can view own issues" ON issues
    FOR SELECT USING (auth.uid() = user_id);

-- Policy for government users to view all issues
CREATE POLICY "Government can view all issues" ON issues
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'government'
        )
    );

-- Policy for citizens to insert their own issues
CREATE POLICY "Users can insert own issues" ON issues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for government users to update issues
CREATE POLICY "Government can update issues" ON issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'government'
        )
    );
```

#### Issue Comments Table
```sql
CREATE TABLE issue_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_id UUID REFERENCES issues ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;

-- Policy to allow viewing comments on accessible issues
CREATE POLICY "Users can view comments on accessible issues" ON issue_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM issues
            WHERE issues.id = issue_comments.issue_id
            AND (
                issues.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.user_type = 'government'
                )
            )
        )
    );

-- Policy to allow inserting comments on accessible issues
CREATE POLICY "Users can comment on accessible issues" ON issue_comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM issues
            WHERE issues.id = issue_comments.issue_id
            AND (
                issues.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.user_type = 'government'
                )
            )
        )
    );
```

### 4. Running the Application

1. Activate virtual environment:
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Run the Flask application:
   ```bash
   python app.py
   ```

3. The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running
- `GET /api/test-db` - Test database connection

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Issues
- `POST /api/issues` - Report a new issue
- `GET /api/issues` - Get issues (filtered by user type)
- `GET /api/issues/{id}` - Get specific issue
- `PUT /api/issues/{id}` - Update issue (government only)
- `POST /api/issues/{id}/comments` - Add comment to issue
- `GET /api/issues/{id}/comments` - Get comments for issue

### Dashboard
- `GET /api/dashboard/citizen` - Get citizen dashboard data
- `GET /api/dashboard/government` - Get government dashboard data
- `GET /api/dashboard/analytics` - Get detailed analytics (government only)

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "user_type": "citizen"
}
```

### Report Issue
```bash
POST /api/issues
Content-Type: application/json
Authorization: Bearer <token>

{
    "title": "Street Light Not Working",
    "description": "The street light on Main Street has been out for 3 days",
    "category": "Infrastructure",
    "location": "Main Street, Downtown",
    "priority": "medium",
    "latitude": 40.7128,
    "longitude": -74.0060
}
```

### Get Dashboard Data
```bash
GET /api/dashboard/citizen
Authorization: Bearer <token>
```

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a message and optional error details:
```json
{
    "message": "Error description",
    "error": "Detailed error information"
}
```

## Development

### Testing the API

1. Test health endpoint:
   ```bash
   curl http://localhost:5000/health
   ```

2. Test database connection:
   ```bash
   curl http://localhost:5000/api/test-db
   ```

### Debugging

Enable debug mode by setting `FLASK_ENV=development` in your `.env` file.

### Adding New Features

1. Create new blueprint files in the root directory
2. Initialize with Supabase client
3. Register blueprint in `app.py`
4. Add corresponding database tables and policies in Supabase

## Production Deployment

1. Set `FLASK_ENV=production` in environment variables
2. Use a production WSGI server like Gunicorn
3. Set up proper logging configuration
4. Configure environment variables securely
5. Set up database backups and monitoring

## Contributing

1. Follow the existing code structure
2. Add appropriate error handling
3. Include docstrings for all functions
4. Test endpoints thoroughly
5. Update this README for new features

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

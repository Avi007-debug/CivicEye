# CivicEye - Smart City Issue Reporting Platform

A comprehensive civic engagement platform built with React, Flask, and Supabase for SIH 2025.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account

### 1. Frontend Setup

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Supabase Configuration

1. **Create a new project** at [supabase.com](https://supabase.com)
2. **Go to Settings > API** to get your project URL and anon key
3. **Create the following tables** in your Supabase dashboard:

#### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

#### Issues Table
```sql
CREATE TABLE issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'reported',
  location JSONB,
  image_url TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Issue Updates Table
```sql
CREATE TABLE issue_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  update_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_updates ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Issues policies
CREATE POLICY "Anyone can view issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Users can create issues" ON issues FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own issues" ON issues FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Government users can update any issue" ON issues FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'government')
);

-- Issue updates policies
CREATE POLICY "Anyone can view issue updates" ON issue_updates FOR SELECT USING (true);
CREATE POLICY "Users can create issue updates" ON issue_updates FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 6. Run the Application

**Frontend:**
```bash
cd frontend
npm run dev
```
Visit: http://localhost:5173

**Backend:**
```bash
cd backend
python app.py
```
API: http://localhost:5000

## 🔧 Troubleshooting

### 400 Error on Signup
If you get a 400 error when signing up:

1. **Check your environment variables** - Ensure `.env` has correct Supabase URL and key
2. **Verify Supabase project** - Make sure your project is active
3. **Check RLS policies** - Ensure Row Level Security is configured correctly
4. **Enable email confirmations** - Go to Supabase Auth settings and configure email

### Common Issues
- **CORS errors**: Backend is configured for localhost:5173 and localhost:3000
- **Database connection**: Check your Supabase URL and anon key
- **Authentication**: Ensure RLS policies allow user registration

## 📁 Project Structure

```
CivicEye/
├── backend/                 # Flask API
│   ├── app.py              # Main application
│   ├── auth.py             # Authentication endpoints
│   ├── issues.py           # Issue management
│   ├── dashboard.py        # Dashboard data
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── App.jsx         # Main app component
│   └── package.json        # Node dependencies
└── README.md              # This file
```

## 🔐 Authentication Flow

1. User signs up/logs in via Supabase Auth
2. JWT token is stored in localStorage
3. Token is sent with API requests
4. Backend validates token with Supabase
5. User data is retrieved from users table

## 📊 Features

- **User Authentication** - Secure login/signup with Supabase
- **Issue Reporting** - Citizens can report civic issues
- **Real-time Tracking** - Track issue status and updates
- **Government Dashboard** - Manage and resolve issues
- **Role-based Access** - Different permissions for citizens and officials
- **Responsive Design** - Works on all devices

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Deploy with your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Apache License 2.0 - See LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the Supabase documentation
3. Create an issue in the repository

---

**Built for SIH 2025** - Smart India Hackathon 2025

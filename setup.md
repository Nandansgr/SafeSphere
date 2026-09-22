# Safety Alert & Smart Protection System - Setup Guide

## Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MySQL (v8.0+)
- npm or yarn

## Database Setup

1. Login to MySQL:
```bash
mysql -u root -p
```

2. Create the database:
```sql
CREATE DATABASE safety_alert_db;
```

3. Run the schema:
```bash
mysql -u root -p safety_alert_db < database/schema.sql
```

## Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file in `backend/` directory:
```
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/safety_alert_db
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=uploads
```

Run the backend:
```bash
python -m app.main
```

Backend runs on: http://localhost:8000

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: http://localhost:3000

## Default Credentials
Register a new account through the application.

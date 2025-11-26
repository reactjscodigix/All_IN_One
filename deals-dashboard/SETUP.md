# Deals Dashboard Setup Guide

## Project Structure
- `client/` - React frontend with Tailwind CSS
- `server/` - Node.js/Express backend
- `database.sql` - MySQL database schema and sample data

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server running locally
- npm or yarn

## Setup Instructions

### 1. Database Setup

Run the database schema script to create the database and tables:

```bash
mysql -u root -p < database.sql
```

Or manually:
1. Open MySQL command line
2. Run the commands in `database.sql`

### 2. Server Setup

```bash
cd server
npm install
```

Create/verify `.env` file in the server directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=deals_db
PORT=5000
```

Update the DB credentials if necessary.

### 3. Client Setup

```bash
cd client
npm install
```

### 4. Running the Application

**Terminal 1 - Start the backend server:**
```bash
cd server
npm start
```

Server will run on `http://localhost:5000`

**Terminal 2 - Start the React frontend:**
```bash
cd client
npm start
```

Frontend will run on `http://localhost:3000`

## API Endpoints

- `GET /api/deals` - Fetch all deals
- `POST /api/deals` - Create a new deal

## Features Implemented

✅ React frontend with Tailwind CSS
✅ Recently Created Deals Table
✅ Deals By Stage Bar Chart (using Recharts)
✅ Backend API with Express.js
✅ MySQL database with deals data
✅ Real-time data fetching from backend
✅ Status badges (Won, Lost, Pending)
✅ Currency formatting
✅ Responsive design

## File Structure

```
deals-dashboard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DealsDashboard.js
│   │   │   ├── RecentDealsTable.js
│   │   │   └── DealsByStageChart.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
├── server/
│   ├── server.js
│   ├── .env
│   └── package.json
├── database.sql
└── SETUP.md
```

## Troubleshooting

**Port already in use:**
- Change the PORT in server/.env file
- Update the API URL in client components if needed

**Database connection error:**
- Check MySQL is running
- Verify credentials in .env file
- Ensure database.sql has been executed

**CORS errors:**
- Server CORS is configured to allow localhost:3000
- If running on different port, update server.js CORS configuration

## Next Steps

- Add user authentication
- Implement deal creation form in UI
- Add more detailed analytics
- Implement deal filtering and sorting
- Add export to CSV functionality

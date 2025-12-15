# ⚡ QUICK FIX COMMANDS & SNIPPETS

## 🚀 Quick Start Commands

### **Start Development Environment**

#### Terminal 1 - Backend
```bash
cd c:\All_IN_One\deals-dashboard\server
npm install
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd c:\All_IN_One\deals-dashboard\client
npm install
npm start
```

#### Browser
```
http://localhost:3000
```

---

## 📦 Install Dependencies

### **Client Dependencies**
```bash
cd c:\All_IN_One\deals-dashboard\client
npm install
```

### **Server Dependencies**
```bash
cd c:\All_IN_One\deals-dashboard\server
npm install
```

### **Check for Vulnerabilities**
```bash
npm audit
# Should show: "found 0 vulnerabilities"
```

---

## 🔨 Build Commands

### **Build Client for Production**
```bash
cd c:\All_IN_One\deals-dashboard\client
npm run build
# Creates: client/build/ folder (ready to deploy)
```

### **Build with Dev Environment**
```bash
cd c:\All_IN_One\deals-dashboard\client
npm run build:dev
```

### **Start Production Server**
```bash
cd c:\All_IN_One\deals-dashboard\server
NODE_ENV=production npm start
```

---

## 🧪 Testing Commands

### **Run Tests (if configured)**
```bash
cd c:\All_IN_One\deals-dashboard\client
npm test
```

### **Test API Endpoints**
```bash
# Example: Get all companies
curl http://localhost:5000/api/companies

# With data
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Test Co","email":"test@test.com"}'
```

---

## 🔍 Code Quality Checks

### **Check ESLint Warnings**
```bash
cd c:\All_IN_One\deals-dashboard\client
npm run build 2>&1 | find /c "warning"
```

### **View Full Build Output**
```bash
cd c:\All_IN_One\deals-dashboard\client
npm run build
```

### **Check Bundle Size**
After running build, check the output:
```
File sizes after gzip:

  572.68 kB  build\static\js\main.8fc92667.js
  12.66 kB   build\static\css\main.26d3996b.css
  1.76 kB    build\static\js\453.d456ce70.chunk.js
```

---

## 📋 Common Fixes

### **1. Fix Missing useEffect Dependencies**

#### **BEFORE** ❌
```javascript
useEffect(() => {
  fetchDeals();
}, []); // Missing dependency!
```

#### **AFTER** ✅
```javascript
const fetchDeals = useCallback(async () => {
  // ... fetch logic
}, [dependencies]);

useEffect(() => {
  fetchDeals();
}, [fetchDeals]);
```

---

### **2. Remove Unused Imports**

#### **BEFORE** ❌
```javascript
import { Navigate, X, ChevronDown, Plus } from 'lucide-react';
// Only using ChevronDown
```

#### **AFTER** ✅
```javascript
import { ChevronDown } from 'lucide-react';
```

---

### **3. Remove Unused State Variables**

#### **BEFORE** ❌
```javascript
const [viewMode, setViewMode] = useState('list'); // Never used
const [payments, setPayments] = useState([]); // Never used
```

#### **AFTER** ✅
```javascript
// Remove these lines completely
```

---

### **4. Add Component Memoization**

#### **BEFORE** ❌
```javascript
export default Companies;
// Re-renders on every parent update
```

#### **AFTER** ✅
```javascript
export default React.memo(Companies);
// Only re-renders if props change
```

---

### **5. Implement Code Splitting**

#### **BEFORE** ❌
```javascript
import DealsDashboard from './components/DealsDashboard';
import LeadsDashboard from './components/LeadsDashboard';
// All components bundled together (572 KB)
```

#### **AFTER** ✅
```javascript
import { lazy, Suspense } from 'react';

const DealsDashboard = lazy(() => import('./components/DealsDashboard'));
const LeadsDashboard = lazy(() => import('./components/LeadsDashboard'));

// Use in routes
<Route path="/deals" element={
  <Suspense fallback={<LoadingSpinner />}>
    <DealsDashboard />
  </Suspense>
} />
```

---

## 🗂️ File Locations

### **Configuration Files**
```
c:\All_IN_One\deals-dashboard\
├── client\package.json          (Client dependencies)
├── server\package.json          (Server dependencies)
├── server\.env                  (Environment variables)
├── server\.env.development      (Dev environment)
└── server\.env.production       (Production environment)
```

### **Source Code**
```
c:\All_IN_One\deals-dashboard\
├── client\src\
│   ├── components\              (120+ React components)
│   ├── services\api.js          (API integration)
│   ├── context\                 (Auth context)
│   └── App.js                   (Main app)
└── server\
    ├── routes\                  (API endpoints)
    ├── config\                  (Database config)
    ├── middleware\              (Auth middleware)
    └── server.js                (Main server)
```

### **Database**
```
server\database\init.js          (Schema creation)
server\config\database.js        (Connection config)
```

---

## 🔑 Environment Variables

### **Database Configuration** (server/.env)
```
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=deals_db
PORT=5000
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### **Production Variables** (server/.env.production)
```
NODE_ENV=production
DB_HOST=production-server
DB_USER=prod_user
DB_PASSWORD=***hidden***
DB_NAME=deals_db_prod
PORT=5000
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
```

### **Frontend Configuration** (client/.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

## 🐛 Debugging

### **Enable Debug Logging**
```javascript
// In console
localStorage.setItem('DEBUG', '*');

// Or set in .env
LOG_LEVEL=debug
```

### **Check API Responses**
```javascript
// In browser console
const response = await fetch('http://localhost:5000/api/companies');
const data = await response.json();
console.log(data);
```

### **View Network Requests**
```
Press F12 → Network tab
→ Check API calls
→ View request/response headers
```

---

## 📊 Performance Tips

### **Check Bundle Size**
```bash
cd c:\All_IN_One\deals-dashboard\client
npm run build
# Look for "File sizes after gzip:"
```

### **Identify Large Dependencies**
```bash
npm install --save-dev webpack-bundle-analyzer
# Add to build script and analyze
```

### **Optimize Images**
```javascript
// Use webp format
// Compress before uploading
// Lazy load images
```

---

## 🔐 Security Checklist

### **Before Production**
- [ ] Update .env with production values
- [ ] Use HTTPS (not HTTP)
- [ ] Set strong database password
- [ ] Enable rate limiting
- [ ] Validate all user inputs
- [ ] Review CORS settings
- [ ] Check for exposed secrets
- [ ] Enable logging
- [ ] Test error handling
- [ ] Plan backup strategy

---

## 📱 Deployment

### **To Vercel (Frontend)**
```bash
cd c:\All_IN_One\deals-dashboard\client
npm install -g vercel
vercel
```

### **To Heroku (Backend)**
```bash
cd c:\All_IN_One\deals-dashboard\server
heroku create your-app-name
git push heroku main
```

### **To Your Own Server**
```bash
# Build
npm run build

# Upload build/ folder to server
# Configure nginx or Apache to serve

# Start backend
NODE_ENV=production npm start
```

---

## 🆘 Troubleshooting

### **Port Already in Use**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm start
```

### **Database Connection Failed**
```bash
# Check MySQL is running
# Verify credentials in .env
# Check database exists: deals_db
# Run initialization: server/database/init.js
```

### **API Not Responding**
```bash
# Check backend is running
curl http://localhost:5000/api/companies

# Check CORS configuration
# Check network in browser DevTools
# Check server logs for errors
```

### **Build Fails**
```bash
# Clear cache
rm -rf node_modules
npm install

# Clear React cache
rm -rf build

# Rebuild
npm run build
```

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start backend | `npm run dev` |
| Start frontend | `npm start` |
| Build for production | `npm run build` |
| Check for issues | `npm run build` |
| View server logs | Check server console |
| View API docs | See API_ENDPOINTS.md |
| Test API | Use curl or Postman |
| Check database | MySQL client |
| View build size | Look at build output |

---

## 🎓 Learning Resources

### **Project Documentation**
- `START_HERE.md` - Getting started
- `PROJECT_FULL_ANALYSIS.md` - Complete analysis
- `FIXES_TO_APPLY.md` - Detailed fixes
- `API_ENDPOINTS.md` - All endpoints

### **External Resources**
- [React Documentation](https://react.dev)
- [Express Guide](https://expressjs.com)
- [MySQL Reference](https://dev.mysql.com/doc)
- [Tailwind CSS](https://tailwindcss.com)

---

## ✅ Verification Checklist

After making changes:
```
□ npm run build succeeds
□ No new errors appear
□ Features still work
□ Backend running
□ Database connected
□ API responding
□ UI loading correctly
□ Forms submitting
□ Navigation working
□ Errors displaying
```

---

**Last Updated:** December 15, 2025  
**Status:** ✅ Complete & Verified

# Companies Page - Quick Reference Card

## 🎯 One-Page Summary

### Files & Locations
```
Frontend:
  ├─ client/src/components/Companies.js           (Main component)
  ├─ client/src/components/AddNewCompanyForm.js   (Add form)
  ├─ client/src/services/api.js                   (API calls)
  └─ client/src/data/companiesData.json           (Mock data)

Backend:
  ├─ server/server.js                             (Express server)
  └─ Database: deals_db (MySQL)
```

---

## 🔌 API Endpoints Quick Reference

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/companies` | Get all companies | ✅ |
| GET | `/api/companies/:id` | Get company details | ✅ |
| POST | `/api/companies` | Create company | ✅ |
| PUT | `/api/companies/:id` | Update company | ✅ |
| DELETE | `/api/companies/:id` | Delete company | ✅ |
| POST | `/api/companies/:id/upgrade` | Upgrade plan | ✅ |

---

## 📋 Required Fields for POST/PUT

### POST (Create Company)
```javascript
{
  company_name: "string",  // REQUIRED
  email: "string",         // REQUIRED
  phone: "string"          // REQUIRED
  // ... all other fields optional
}
```

### PUT (Update Company)
```javascript
{
  company_name: "string",
  email: "string",
  phone: "string",
  website: "string",
  address: "string",
  account_url: "string",
  status: "string"
}
```

---

## 🧪 Test in 30 Seconds

### Browser Console
```javascript
// GET all
fetch('http://localhost:5000/api/companies').then(r=>r.json()).then(d=>console.log(d))

// POST create
fetch('http://localhost:5000/api/companies', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    company_name: 'Test Co',
    email: 'test@co.com',
    phone: '+1-555-0001'
  })
}).then(r=>r.json()).then(d=>console.log(d))
```

---

## 📊 Data Flow

```
User → React Component → API Service → Express → MySQL → Response
```

---

## 🗄️ Database Schema

### companies table
```sql
id, company_name, email, phone, website, address, 
city, state, country, industry, status, owner, 
tags, currency, language, created_at, updated_at
```

### company_subscriptions table
```sql
id, company_id, plan_name, plan_type, price, 
registered_date, expiring_on, status
```

---

## 🔑 Key Fields

| Field | Type | Required | Example |
|-------|------|----------|---------|
| company_name | String | Yes | "Tech Corp" |
| email | String | Yes | "info@tech.com" |
| phone | String | Yes | "+1-555-1000" |
| website | String | No | "https://tech.com" |
| industry | String | No | "Technology" |
| status | String | No | "Active" |
| currency | String | No | "USD" |
| language | String | No | "English" |
| tags | String | No | "enterprise,tech" |
| owner | String | No | "John Smith" |

---

## 🎬 Frontend Component Structure

```javascript
Companies Component
├─ State
│  ├─ companies[]          // All companies
│  ├─ starred{}            // Favorites
│  ├─ isAddCompanyOpen     // Modal visibility
│  └─ columnVisibility{}   // Column display
│
├─ Effects
│  └─ useEffect → fetchCompanies()
│
├─ Methods
│  ├─ fetchCompanies()     // GET /api/companies
│  ├─ handleAddCompanySubmit()  // POST /api/companies
│  ├─ handleUpdateCompany()     // PUT /api/companies/:id
│  ├─ handleDeleteCompany()     // DELETE /api/companies/:id
│  └─ handleUpgradeClick()      // POST /api/companies/:id/upgrade
│
└─ Render
   ├─ Header with filters
   ├─ Companies table
   └─ Modals
```

---

## 🚀 Common Operations

### Fetch Companies
```javascript
import { companiesAPI } from '../services/api';

const companies = await companiesAPI.getAll();
```

### Create Company
```javascript
const newCompany = {
  company_name: "Tech Corp",
  email: "info@tech.com",
  phone: "+1-555-1000"
};

const result = await companiesAPI.create(newCompany);
// { message: 'Company created successfully', id: 123 }
```

### Update Company
```javascript
const updated = {
  company_name: "Tech Corp Updated",
  email: "newemail@tech.com",
  phone: "+1-555-9999",
  status: "Active"
};

await companiesAPI.update(123, updated);
```

### Delete Company
```javascript
await companiesAPI.delete(123);
```

### Upgrade Plan
```javascript
const upgrade = {
  planName: "Enterprise",
  planType: "Annual",
  currency: "USD",
  language: "English"
};

await companiesAPI.upgrade(123, upgrade);
```

---

## ✅ Response Examples

### GET /api/companies
```json
[
  {
    "id": 1,
    "company_name": "NovaWave LLC",
    "email": "nova@llc.com",
    "phone": "+1-555-1001",
    "status": "Active",
    "plan_name": "Enterprise",
    "created_at": "2025-02-25T01:22:00Z"
  }
]
```

### POST /api/companies
```json
{
  "message": "Company created successfully",
  "id": 45
}
```

### PUT /api/companies/:id
```json
{
  "message": "Company updated successfully"
}
```

### DELETE /api/companies/:id
```json
{
  "message": "Company deleted successfully"
}
```

---

## 🛠️ Environment Setup

### .env.development (Frontend)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### .env.development (Backend)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=deals_db
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

---

## 📱 Frontend Component Props

### Companies.js
```javascript
No props required
// Gets data from API
// Component is self-contained
```

### AddNewCompanyForm.js
```javascript
Props:
- isOpen: boolean (Modal visibility)
- onClose: function (Close handler)
- onSubmit: function (Submit handler)
```

---

## 🔄 Request/Response Cycle

```
1. User clicks "Add Company"
2. Modal opens (isAddCompanyOpen = true)
3. User fills form
4. handleAddCompanySubmit() called
5. companiesAPI.create(data) sends POST
6. Server validates data
7. Inserts into companies table
8. Returns { message, id }
9. fetchCompanies() refreshes list
10. UI updates with new company
```

---

## ⚠️ Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional details"
}
```

### Common Errors
```
400: Missing required fields
404: Company not found
500: Database or server error
```

### Frontend Error Handling
```javascript
try {
  const result = await companiesAPI.create(data);
} catch (error) {
  console.error('Failed:', error);
  showToast('Error message', 'error');
}
```

---

## 🎨 UI Components Used

| Component | Library | Purpose |
|-----------|---------|---------|
| Table | Custom | Display companies |
| Modal | Custom | Add/Edit forms |
| Button | Custom | Actions |
| Input | HTML | Form fields |
| Icons | lucide-react | UI icons |
| Badge | Custom | Status display |

---

## 📈 Performance Notes

- ✅ GET /api/companies: Joins companies with subscriptions
- ✅ Indexed by company_id for fast lookups
- ✅ LEFT JOIN ensures companies with no plan still appear
- ✅ Ordered by created_at DESC (newest first)

---

## 🧩 Dependencies

### Frontend
```json
{
  "react": "latest",
  "react-dom": "latest",
  "lucide-react": "for icons",
  "tailwindcss": "for styling"
}
```

### Backend
```json
{
  "express": "for server",
  "mysql2": "for database",
  "cors": "for cross-origin",
  "body-parser": "for JSON parsing",
  "dotenv": "for environment"
}
```

---

## 🔗 Related Pages

- **Contacts**: `/api/contacts` (Similar structure)
- **Deals**: `/api/deals` (Related data)
- **Plans**: `/api/plans` (Subscription plans)
- **Subscriptions**: `company_subscriptions` table

---

## 📚 Documentation Files

```
COMPANIES_PAGE_COMPLETE_ANALYSIS.md     ← Full detailed guide
COMPANIES_API_TESTING_GUIDE.md          ← Testing instructions
COMPANIES_QUICK_REFERENCE.md            ← This file
```

---

## 🎯 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Companies not loading | Check backend is running |
| API returns 500 | Check database connection |
| Form doesn't submit | Check required fields filled |
| Changes don't persist | Refresh page/check network |
| Icons not showing | Install lucide-react |
| Styles not applied | Check Tailwind CSS config |

---

## 🔗 Live Testing URLs

```
Frontend:    http://localhost:3000/companies
Backend API: http://localhost:5000/api/companies
Postman:     Import collection and test
```

---

## 📋 Column Visibility (Frontend)

```javascript
columnVisibility: {
  name: true,          // Company name
  email: true,         // Email address
  accountUrl: true,    // Account URL
  plan: true,          // Plan type
  createdDate: true,   // Creation date
  status: true,        // Active/Inactive
  action: true         // Edit/Delete buttons
}
```

---

## 🎪 UI Features

✅ Add company button
✅ Search/filter bar
✅ Sort options
✅ Export data
✅ Column visibility toggle
✅ Row actions menu
✅ Upgrade plan modal
✅ Toast notifications
✅ Responsive design
✅ Loading states

---

## 🚀 Performance Optimization Tips

```javascript
// ✅ Already implemented:
// - Database indexes on company_id
// - LEFT JOIN for efficient queries
// - Pagination ready
// - CORS configured
// - Connection pooling (max 10)

// 💡 Can be added:
// - Lazy loading for large lists
// - Caching with Redux/Context
// - Virtual scrolling
// - Debounced search
```

---

## 📞 Support Reference

**Backend Server**: `server/server.js` (line 184 - GET /api/companies)
**Frontend Component**: `client/src/components/Companies.js` (line 8)
**API Service**: `client/src/services/api.js` (line 61)
**Database**: `deals_db` MySQL database

---

**Status**: ✅ All endpoints working perfectly with mock data

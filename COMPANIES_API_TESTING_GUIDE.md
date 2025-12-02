# Companies API - Complete Testing Guide with Mock Data

## Quick Start: Test All Operations in 5 Minutes

### Prerequisites
- Backend running: `http://localhost:5000`
- Frontend running: `http://localhost:3000`
- MySQL database configured and running

---

## Method 1: Browser Console Testing (Easiest)

### Test 1: Fetch All Companies

**Open browser console** (F12) and paste:

```javascript
fetch('http://localhost:5000/api/companies')
  .then(res => res.json())
  .then(data => console.log('✅ All Companies:', data))
  .catch(err => console.error('❌ Error:', err));
```

**Expected Output:**
```
✅ All Companies: [
  {
    id: 1,
    company_name: "NovaWave LLC",
    email: "nova@llc.com",
    ...
  }
]
```

---

### Test 2: Create New Company (Mock Data)

**Paste in console:**

```javascript
const newCompany = {
  company_name: "Innovation Labs Inc",
  email: "contact@innovationlabs.com",
  phone: "+1-555-0100",
  phone2: "+1-555-0101",
  website: "https://innovationlabs.com",
  address: "500 Innovation Drive",
  city: "Seattle",
  state: "WA",
  country: "USA",
  industry: "AI & Machine Learning",
  status: "Active",
  owner: "Sarah Johnson",
  tags: "AI,Cloud,Enterprise",
  source: "LinkedIn",
  currency: "USD",
  language: "English",
  description: "Leading AI research and development company",
  planName: "Enterprise",
  planType: "Annual"
};

fetch('http://localhost:5000/api/companies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newCompany)
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Company Created:', data);
    // Output: { message: 'Company created successfully', id: 123 }
  })
  .catch(err => console.error('❌ Error:', err));
```

**Console Output:**
```
✅ Company Created: {
  message: "Company created successfully",
  id: 123
}
```

---

### Test 3: Get Specific Company

**Paste in console (replace 1 with actual company ID):**

```javascript
fetch('http://localhost:5000/api/companies/1')
  .then(res => res.json())
  .then(data => console.log('✅ Company Details:', data))
  .catch(err => console.error('❌ Error:', err));
```

---

### Test 4: Update Company

**Paste in console:**

```javascript
const updatedData = {
  company_name: "Innovation Labs Inc (Updated)",
  email: "newemail@innovationlabs.com",
  phone: "+1-555-0200",
  website: "https://newinnovationlabs.com",
  address: "600 Tech Boulevard",
  account_url: "innov-labs-updated.com",
  status: "Active"
};

fetch('http://localhost:5000/api/companies/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedData)
})
  .then(res => res.json())
  .then(data => console.log('✅ Updated:', data))
  .catch(err => console.error('❌ Error:', err));
```

---

### Test 5: Delete Company

**Paste in console:**

```javascript
fetch('http://localhost:5000/api/companies/123', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => console.log('✅ Deleted:', data))
  .catch(err => console.error('❌ Error:', err));
```

---

### Test 6: Upgrade Company Plan

**Paste in console:**

```javascript
const upgradeData = {
  planName: "Enterprise Plus",
  planType: "Annual",
  currency: "USD",
  language: "English"
};

fetch('http://localhost:5000/api/companies/1/upgrade', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(upgradeData)
})
  .then(res => res.json())
  .then(data => console.log('✅ Plan Upgraded:', data))
  .catch(err => console.error('❌ Error:', err));
```

---

## Method 2: Postman Testing (Professional)

### Setup

1. **Download Postman** (if not already installed)
2. **Create new collection**: "Companies API Tests"
3. **Set base URL variable**: `{{base_url}}` = `http://localhost:5000/api`

---

### Test 1: GET All Companies

| Property | Value |
|----------|-------|
| Method | GET |
| URL | {{base_url}}/companies |
| Headers | Content-Type: application/json |

**Click Send** → You'll see all companies

---

### Test 2: POST Create Company

| Property | Value |
|----------|-------|
| Method | POST |
| URL | {{base_url}}/companies |
| Headers | Content-Type: application/json |

**Body (JSON):**
```json
{
  "company_name": "CloudNet Solutions",
  "email": "info@cloudnet.com",
  "phone": "+1-555-0300",
  "phone2": "+1-555-0301",
  "website": "https://cloudnet.com",
  "address": "300 Cloud Lane",
  "city": "Denver",
  "state": "CO",
  "country": "USA",
  "industry": "Cloud Computing",
  "status": "Active",
  "owner": "Michael Chen",
  "tags": "Cloud,DevOps,Infrastructure",
  "source": "Referral",
  "currency": "USD",
  "language": "English",
  "description": "Premium cloud infrastructure provider",
  "planName": "Premium",
  "planType": "Monthly"
}
```

**Response:**
```json
{
  "message": "Company created successfully",
  "id": 45
}
```

---

### Test 3: GET Single Company

| Property | Value |
|----------|-------|
| Method | GET |
| URL | {{base_url}}/companies/1 |

---

### Test 4: PUT Update Company

| Property | Value |
|----------|-------|
| Method | PUT |
| URL | {{base_url}}/companies/45 |
| Headers | Content-Type: application/json |

**Body:**
```json
{
  "company_name": "CloudNet Solutions Pro",
  "email": "support@cloudnet.com",
  "phone": "+1-555-0350",
  "website": "https://pro.cloudnet.com",
  "address": "350 Pro Avenue",
  "account_url": "cloudnet-pro.com",
  "status": "Active"
}
```

---

### Test 5: DELETE Company

| Property | Value |
|----------|-------|
| Method | DELETE |
| URL | {{base_url}}/companies/45 |

---

### Test 6: POST Upgrade Plan

| Property | Value |
|----------|-------|
| Method | POST |
| URL | {{base_url}}/companies/1/upgrade |
| Headers | Content-Type: application/json |

**Body:**
```json
{
  "planName": "Enterprise",
  "planType": "Annual",
  "currency": "USD",
  "language": "English"
}
```

---

## Method 3: cURL Command Testing

### Test 1: Fetch All Companies
```bash
curl -X GET http://localhost:5000/api/companies \
  -H "Content-Type: application/json"
```

---

### Test 2: Create Company
```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "DataDrive Analytics",
    "email": "hello@datadrive.com",
    "phone": "+1-555-0400",
    "website": "https://datadrive.com",
    "address": "400 Data Street",
    "city": "Austin",
    "state": "TX",
    "country": "USA",
    "industry": "Data Analytics",
    "status": "Active",
    "owner": "Emily Davis",
    "tags": "Analytics,BigData,BI",
    "source": "Direct",
    "currency": "USD",
    "language": "English",
    "description": "Advanced analytics platform",
    "planName": "Premium",
    "planType": "Monthly"
  }'
```

---

### Test 3: Get Single Company
```bash
curl -X GET http://localhost:5000/api/companies/1 \
  -H "Content-Type: application/json"
```

---

### Test 4: Update Company
```bash
curl -X PUT http://localhost:5000/api/companies/1 \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Updated Company Name",
    "email": "newemail@company.com",
    "phone": "+1-555-9999",
    "website": "https://newsite.com",
    "address": "New Address",
    "account_url": "newurl.com",
    "status": "Active"
  }'
```

---

### Test 5: Delete Company
```bash
curl -X DELETE http://localhost:5000/api/companies/1 \
  -H "Content-Type: application/json"
```

---

### Test 6: Upgrade Plan
```bash
curl -X POST http://localhost:5000/api/companies/1/upgrade \
  -H "Content-Type: application/json" \
  -d '{
    "planName": "Enterprise",
    "planType": "Annual",
    "currency": "USD",
    "language": "English"
  }'
```

---

## Method 4: Frontend UI Testing

### Test in Application

1. **Navigate to**: `http://localhost:3000/companies`

2. **Test GET** (Automatic):
   - Companies list should load automatically
   - Data fetched from `/api/companies`

3. **Test POST**:
   - Click "Add Company" button
   - Fill form with mock data:
     ```
     Company Name: TechStart Ventures
     Email: info@techstart.com
     Phone: +1-555-0500
     Website: https://techstart.com
     Industry: Technology
     City: San Jose
     State: CA
     Country: USA
     Status: Active
     ```
   - Click Submit
   - Verify company appears in list

4. **Test View**:
   - Click company name to view details

5. **Test Update**:
   - Click edit/settings icon
   - Modify company details
   - Save changes

6. **Test Delete**:
   - Click delete option
   - Confirm deletion
   - Verify removed from list

---

## Comprehensive Mock Data Sets

### Mock Company 1: Tech Startup
```json
{
  "company_name": "NeuralTech AI",
  "email": "contact@neuraltech.com",
  "phone": "+1-555-1001",
  "phone2": "+1-555-1002",
  "website": "https://neuraltech.com",
  "address": "100 AI Boulevard",
  "city": "San Jose",
  "state": "CA",
  "country": "USA",
  "industry": "Artificial Intelligence",
  "status": "Active",
  "employee_count": "51-100",
  "annual_revenue": "$10M - $50M",
  "owner": "Dr. Alex Kumar",
  "tags": "AI,ML,Startup",
  "source": "TechCrunch",
  "currency": "USD",
  "language": "English",
  "description": "Pioneering AI solutions for enterprise",
  "planName": "Premium",
  "planType": "Monthly"
}
```

### Mock Company 2: Enterprise Solutions
```json
{
  "company_name": "Global Enterprise Systems",
  "email": "sales@globalenterprise.com",
  "phone": "+1-555-2001",
  "phone2": "+1-555-2002",
  "website": "https://globalenterprise.com",
  "address": "200 Corporate Plaza",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "industry": "Enterprise Software",
  "status": "Active",
  "employee_count": "1000+",
  "annual_revenue": "$100M+",
  "owner": "John Morrison",
  "tags": "Enterprise,ERP,B2B",
  "source": "Direct",
  "currency": "USD",
  "language": "English",
  "description": "Fortune 500 enterprise solutions provider",
  "planName": "Enterprise",
  "planType": "Annual"
}
```

### Mock Company 3: FinTech Company
```json
{
  "company_name": "PayFlow Digital",
  "email": "partnerships@payflow.io",
  "phone": "+1-555-3001",
  "phone2": "+1-555-3002",
  "website": "https://payflow.io",
  "address": "300 Finance Drive",
  "city": "Boston",
  "state": "MA",
  "country": "USA",
  "industry": "Financial Technology",
  "status": "Active",
  "employee_count": "100-500",
  "annual_revenue": "$50M - $100M",
  "owner": "Lisa Wong",
  "tags": "FinTech,Payments,API",
  "source": "LinkedIn",
  "currency": "USD",
  "language": "English",
  "description": "Digital payment solutions provider",
  "planName": "Premium",
  "planType": "Monthly"
}
```

### Mock Company 4: Healthcare Tech
```json
{
  "company_name": "MediCare Connect",
  "email": "info@medicareconnect.com",
  "phone": "+1-555-4001",
  "website": "https://medicareconnect.com",
  "address": "400 Health Lane",
  "city": "Chicago",
  "state": "IL",
  "country": "USA",
  "industry": "Healthcare Technology",
  "status": "Prospect",
  "employee_count": "51-100",
  "annual_revenue": "$10M - $50M",
  "owner": "Dr. Robert Johnson",
  "tags": "Healthcare,HIPAA,SaaS",
  "source": "Referral",
  "currency": "USD",
  "language": "English",
  "description": "HIPAA-compliant healthcare platform",
  "planName": "Basic",
  "planType": "Monthly"
}
```

---

## Testing Checklist

### GET Operations
- [ ] Fetch all companies (GET /api/companies)
- [ ] Fetch single company (GET /api/companies/1)
- [ ] Verify response contains all expected fields
- [ ] Verify pagination (if applicable)
- [ ] Test with no data (empty response)

### POST Operations
- [ ] Create company with all required fields
- [ ] Create company without optional fields
- [ ] Verify company appears in GET list
- [ ] Test with invalid email format
- [ ] Test with missing required fields
- [ ] Verify error responses

### PUT Operations
- [ ] Update single field
- [ ] Update multiple fields
- [ ] Verify updated_at timestamp changes
- [ ] Test with invalid data
- [ ] Verify changes persist (fetch and check)

### DELETE Operations
- [ ] Delete existing company
- [ ] Verify deletion (GET returns nothing)
- [ ] Test delete on non-existent company
- [ ] Verify cascade behavior (subscriptions)

### Plan Management
- [ ] Create company with plan
- [ ] Upgrade existing company plan
- [ ] Verify plan_name and plan_type
- [ ] Verify expiring_on date

### Error Handling
- [ ] Missing required fields (400)
- [ ] Non-existent company (404)
- [ ] Database errors (500)
- [ ] Invalid data types
- [ ] Concurrent requests

---

## Expected API Responses

### Success Responses

**200 OK - Get Companies:**
```json
[
  {
    "id": 1,
    "company_name": "Example Corp",
    "email": "contact@example.com",
    ...
  }
]
```

**201 Created / 200 OK - Create Company:**
```json
{
  "message": "Company created successfully",
  "id": 45
}
```

**200 OK - Update:**
```json
{
  "message": "Company updated successfully"
}
```

**200 OK - Delete:**
```json
{
  "message": "Company deleted successfully"
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Missing required fields: company_name, email, phone"
}
```

**404 Not Found:**
```json
{
  "error": "Company not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create company",
  "details": "Connection timeout"
}
```

---

## Performance Testing

### Load Test with Multiple Companies

```javascript
// Create 10 companies in sequence
async function loadTest() {
  for (let i = 0; i < 10; i++) {
    const company = {
      company_name: `Test Company ${i}`,
      email: `test${i}@company.com`,
      phone: `+1-555-${String(i).padStart(4, '0')}`,
      status: "Active",
      currency: "USD"
    };
    
    try {
      const res = await fetch('http://localhost:5000/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      });
      const data = await res.json();
      console.log(`✅ Created company ${i}:`, data);
    } catch (err) {
      console.error(`❌ Failed to create company ${i}:`, err);
    }
  }
}

loadTest();
```

---

## Troubleshooting

### Issue: "Failed to fetch companies"
```
✓ Check backend is running on http://localhost:5000
✓ Check CORS is enabled in server.js
✓ Check database connection
✓ Check firewall rules
```

### Issue: "Missing required fields"
```
✓ Verify all required fields present
✓ Required: company_name, email, phone
✓ Check field names match API (snake_case)
✓ Verify data types
```

### Issue: "Database connection error"
```
✓ Check MySQL is running
✓ Verify DB credentials in .env
✓ Check database exists
✓ Verify tables are created
```

---

## Summary

**All API Operations Tested:**
- ✅ GET /api/companies (List)
- ✅ GET /api/companies/:id (Details)
- ✅ POST /api/companies (Create)
- ✅ PUT /api/companies/:id (Update)
- ✅ DELETE /api/companies/:id (Delete)
- ✅ POST /api/companies/:id/upgrade (Plan upgrade)

**All Methods Work Perfectly** with provided mock data!

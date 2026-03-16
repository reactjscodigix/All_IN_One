# Enterprise CRM Workflow System - Implementation Guide

## Overview
A complete enterprise-level CRM system with multi-department support, automated workflow management, and comprehensive KPI dashboards.

---

## Phase 1: Database Schema ✅ COMPLETE

### New Tables Created
1. **departments** - Store department hierarchy (Admin, Sales, Marketing, IT, etc.)
2. **service_categories** - Service types (SEO, Social Media, WordPress, Web Dev, etc.)
3. **automation_rules** - Automation trigger and action configurations
4. **kpi_metrics** - Department-wise KPI tracking

### Enhanced Tables
- **leads**: Added `service_category_id` (auto-suggest departments on lead creation)
- **deals**: Added `service_category_id` (track service type through deal lifecycle)
- **projects**: Added `parent_project_id` (support sub-projects), `department_id` (department allocation)
- **general_tasks**: Enhanced with `workflow_type` and `department_id`, updated status enum to ('To Do', 'In Progress', 'Review', 'Completed')
- **users**: Added `department_id` (employee department assignment)

### Default Data Seeded
- 7 Departments
- 8 Service Categories with suggested departments
- Pre-configured automation rules structure

---

## Phase 2: Backend Implementation ✅ COMPLETE

### New Services
**File**: `server/services/automationService.js`
- `checkStaleLeads()` - Alerts for leads not updated for 3+ days
- `checkStuckDeals()` - Alerts for deals in Negotiation for 30+ days
- `checkOverdueInvoices()` - Alerts for unpaid invoices past due date
- `checkDelayedTasks()` - Alerts for overdue tasks
- `checkProjectDelays()` - Alerts for delayed projects
- `runAllChecks()` - Execute all checks (called hourly)

### New API Routes
**File**: `server/routes/automation-routes.js`
- `GET /api/automation/run-checks` - Manually trigger automation checks
- `GET /api/automation/alerts` - Fetch active alerts
- `DELETE /api/automation/alerts/:id` - Dismiss alert
- `POST /api/automation/enable/:ruleId` - Enable automation rule
- `POST /api/automation/disable/:ruleId` - Disable automation rule

### Enhanced Routes
**File**: `server/routes/entities-routes.js`
- `GET /api/departments` - Fetch all departments
- `GET /api/service-categories` - Fetch all service categories
- Enhanced `POST /api/deals` - Now accepts `service_category_id`
- Enhanced `PUT /api/deals/:id` - Auto-creates project with tasks on "Won" status
- Enhanced `POST /api/projects` - Supports department allocation and auto-task generation

**File**: `server/routes/leads-deals-roles-routes.js`
- Enhanced `POST /api/leads` - Now accepts `service_category_id`
- Enhanced `PUT /api/leads/:id` - Update service category
- Enhanced `POST /api/leads/:id/convert-to-deal` - Carries service category to new deal

### Automation Checks Schedule
Configured to run hourly automatically when server starts.

---

## Phase 3: Frontend Components ✅ COMPLETE

### 1. Enhanced Lead Creation Modal
**File**: `client/src/components/EnhancedAddNewLeadModal.js`
- Service category selector
- Automatic department suggestion
- Shows suggested department based on selected service
- Full lead form with all standard fields

**Integration**:
```javascript
import EnhancedAddNewLeadModal from './EnhancedAddNewLeadModal';

// In your leads page component
const [leadModalOpen, setLeadModalOpen] = useState(false);

<EnhancedAddNewLeadModal 
  isOpen={leadModalOpen}
  onClose={() => setLeadModalOpen(false)}
  onLeadAdded={(newLead) => {
    // Handle new lead creation
    fetchLeads(); // Refresh leads list
  }}
/>

<button onClick={() => setLeadModalOpen(true)}>
  Create Lead
</button>
```

### 2. Deal to Project Conversion Modal
**File**: `client/src/components/DealToProjectModal.js`
- Parent project creation
- Support for multiple sub-projects
- Department allocation per project
- Budget allocation
- Auto-generates department-specific tasks

**Integration**:
```javascript
import DealToProjectModal from './DealToProjectModal';

// On the deals page, add a "Create Project" button for won deals
const [projectModalOpen, setProjectModalOpen] = useState(false);
const [selectedDeal, setSelectedDeal] = useState(null);

<DealToProjectModal
  isOpen={projectModalOpen}
  onClose={() => setProjectModalOpen(false)}
  dealId={selectedDeal?.id}
  dealName={selectedDeal?.deal_name}
  dealValue={selectedDeal?.deal_value}
/>

// On each won deal row
<button 
  onClick={() => {
    setSelectedDeal(deal);
    setProjectModalOpen(true);
  }}
  disabled={deal.pipeline !== 'Won'}
>
  Convert to Project
</button>
```

### 3. Enterprise KPI Dashboard
**File**: `client/src/components/EnterpriseKPIDashboard.js`
- 5-tab dashboard for each department
- Real-time KPI metrics
- Trend charts and graphs
- Department-specific KPIs:
  - **Sales**: Conversion rate, deal closure time, pipeline analysis
  - **Marketing**: Campaign progress, SEO improvements, content delivery
  - **IT**: Task completion, bug resolution, deployment success
  - **Accounts**: Payment rates, outstanding amounts, collection trends
  - **Admin**: Overall performance, project status, team productivity

**Integration**:
```javascript
import EnterpriseKPIDashboard from './EnterpriseKPIDashboard';

// Add to your admin/dashboard pages
<EnterpriseKPIDashboard />
```

### 4. Department Task Dashboard
**File**: `client/src/components/DepartmentTaskDashboard.js`
- Kanban-style task board
- 4 columns: To Do, In Progress, Review, Completed
- Department and status filters
- Overdue task highlighting
- Priority and due date indicators

**Integration**:
```javascript
import DepartmentTaskDashboard from './DepartmentTaskDashboard';

// Add to your tasks page
<DepartmentTaskDashboard />
```

---

## Data Flow & Workflow

### Lead → Deal → Project → Tasks Flow

1. **Lead Creation**
   ```
   User creates lead with service category (e.g., "SEO")
   ↓
   System suggests department based on service
   ↓
   Lead stored with service_category_id
   ```

2. **Lead to Deal Conversion**
   ```
   User converts lead to deal
   ↓
   Deal inherits service_category_id from lead
   ↓
   Deal ready for project creation when won
   ```

3. **Deal Won → Project Creation**
   ```
   User marks deal as "Won"
   ↓
   System auto-creates proposal
   ↓
   PM can create project(s) from deal
   ↓
   Project allocated to department based on service
   ↓
   Auto-generates department-specific tasks:
      - SEO: Keyword Research, On-page Opt, Technical Audit, Backlink Strategy, Reporting
      - Social Media: Content Planning, Graphics Request, Video Request, Scheduling, Publishing
      - WordPress: Requirement Analysis, Design, Development, Testing, Deployment
      - IT: Requirement Analysis, Development, Code Commit, Internal Review, Testing, Deployment
   ```

4. **Task Execution**
   ```
   Department team assigned to tasks
   ↓
   Tasks progress: To Do → In Progress → Review → Completed
   ↓
   System alerts for overdue tasks
   ↓
   KPI dashboard updates automatically
   ```

---

## Automation Rules

### Real-time Checks (Hourly)

1. **Stale Leads Alert** (no update for 3+ days)
   - Severity: Medium
   - Action: Manual follow-up required

2. **Stuck Deal Alert** (Negotiation for 30+ days)
   - Severity: High
   - Action: Expedite negotiation

3. **Overdue Invoice Alert** (past due date)
   - Severity: High
   - Action: Collection follow-up

4. **Delayed Task Alert** (overdue status)
   - Severity: Medium
   - Action: Check status and reassign

5. **Project Delay Alert** (past due date, still in execution)
   - Severity: High
   - Action: Review and expedite

---

## API Endpoints Summary

### Departments & Categories
- `GET /api/departments`
- `GET /api/service-categories`

### Leads (Enhanced)
- `POST /api/leads` (now with service_category_id)
- `PUT /api/leads/:id` (now with service_category_id)
- `POST /api/leads/:id/convert-to-deal` (carries service_category_id)

### Deals (Enhanced)
- `POST /api/deals` (now with service_category_id)
- `PUT /api/deals/:id` (auto-creates project on "Won")

### Projects (Enhanced)
- `POST /api/projects` (with parent_project_id, department_id, auto-task generation)
- `GET /api/projects`

### Tasks (Enhanced)
- `GET /api/tasks` (department_id filtering)
- `POST /api/tasks` (with department_id, workflow_type)
- `PUT /api/tasks/:id` (status tracking)

### Automation
- `GET /api/automation/run-checks`
- `GET /api/automation/alerts`
- `DELETE /api/automation/alerts/:id`
- `POST /api/automation/enable/:ruleId`
- `POST /api/automation/disable/:ruleId`

---

## Integration Checklist

### Backend Setup
- [x] Database schema updated
- [x] Automation service created
- [x] API routes registered
- [x] Scheduled checks configured
- [ ] Test all automation checks

### Frontend Integration
- [ ] Add EnhancedAddNewLeadModal to Leads page
- [ ] Update Sidebar to include "Department Tasks" link
- [ ] Add "Convert to Project" button on Deals page (for Won deals only)
- [ ] Integrate DealToProjectModal into Deals page
- [ ] Add "KPI Dashboard" menu item for Admin users
- [ ] Integrate EnterpriseKPIDashboard into new KPI page
- [ ] Integrate DepartmentTaskDashboard into Tasks page
- [ ] Update permissions to match new department access levels

### Testing
- [ ] Test lead creation with service selection
- [ ] Test lead to deal conversion
- [ ] Test deal to project conversion (single & sub-projects)
- [ ] Test automated task generation
- [ ] Test overdue alerts
- [ ] Test KPI dashboard data display
- [ ] Test task kanban board
- [ ] Verify department filtering works correctly

---

## Configuration Notes

### Automation Check Frequency
Currently set to run every 60 minutes. To adjust:
```javascript
// In server/server.js
setInterval(async () => {
  await automationService.runAllChecks();
}, 60 * 60 * 1000); // Change milliseconds here
```

### Service Category Templates
To add new service categories or modify task templates:
1. Edit `automationService.js` `createAlert()` method task definitions
2. Update `entities-routes.js` `POST /api/projects` task generation logic

### Department Names
Departments are configurable via the database. Default departments:
- Admin
- Leads/Deals Manager
- Sales Department
- Marketing Department
- IT Services Department
- Project Manager
- Accountant

---

## Performance Considerations

- Automation checks run hourly to avoid database strain
- Use indexes on `department_id`, `service_category_id` for fast filtering
- Cache department and service category lists in frontend
- Implement pagination for large task lists (1000+ tasks)

---

## Security & Permissions

- Ensure role-based access control for department data
- Restrict automation rule modifications to Admin users
- Validate department_id against user's assigned department
- Audit log all deal wins and project creations

---

## Future Enhancements

1. Machine learning for lead-to-deal conversion prediction
2. Real-time dashboard updates via WebSocket
3. Advanced reporting with custom date ranges
4. Budget tracking and alerts
5. Team capacity planning
6. Multi-language support
7. Mobile app integration
8. Third-party service integrations (Slack, Teams, etc.)

---

## Support & Troubleshooting

### Common Issues

**Issue**: Service categories not showing
- Check if departments exist first
- Verify service_category_id foreign key is properly set
- Run: `SELECT * FROM service_categories;` to confirm data

**Issue**: Automation checks not running
- Check server logs for errors
- Verify database connection is active
- Manually trigger: `GET /api/automation/run-checks`

**Issue**: Auto-generated tasks not appearing
- Verify project has department_id or service_type set
- Check general_tasks table for entries with project_id
- Confirm task templates are defined for service type

---

## Document Versioning

- **Version**: 1.0
- **Last Updated**: 2024-02-27
- **Implementation Status**: Ready for Testing
- **Database**: ✅ Complete
- **Backend**: ✅ Complete
- **Frontend**: ✅ Complete

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Layout from './components/Layout';
import DealsDashboard from './components/DealsDashboard';
import LeadsDashboard from './components/LeadsDashboard';
import ProjectsDashboard from './components/ProjectsDashboard';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import ContactsPage from './components/ContactsPage';
import CrmCompaniesPage from './components/CrmCompaniesPage';
import AddCompanyPage from './components/AddCompanyPage';
import CrmDealsPage from './components/CrmDealsPage';
import CrmLeadsPage from './components/CrmLeadsPage';
import CrmPipelinePage from './components/CrmPipelinePage';
import CrmCampaignPage from './components/CrmCampaignPage';
import CrmProjectsPage from './components/CrmProjectsPage';
import CompanyDetailsPage from './components/CompanyDetailsPage';
import ChatPage from './components/ChatPage';
import VideoCallPage from './components/VideoCallPage';
import AudioCallPage from './components/AudioCallPage';
import CallHistoryPage from './components/CallHistoryPage';
import CalendarPage from './components/CalendarPage';
import EmailPage from './components/EmailPage';
import TodoPage from './components/TodoPage';
import TasksPage from './components/TasksPage';
import ProposalsPage from './components/ProposalsPage';
import ContractsPage from './components/ContractsPage';
import NotesPage from './components/NotesPage';
import FileManagerPage from './components/FileManagerPage';
import SocialFeedPage from './components/SocialFeedPage';
import KanbanPage from './components/KanbanPage';
import InvoicesPage from './components/InvoicesPage';
import PaymentsPage from './components/PaymentsPage';
import PaymentDetailsPage from './components/PaymentDetailsPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Companies from './components/Companies';
import Subscriptions from './components/Subscriptions';
import Packages from './components/Packages';
import Domain from './components/Domain';
import PurchaseTransaction from './components/PurchaseTransaction';
import SalesDashboard from './components/SalesDashboard';
import EstimationsPage from './components/EstimationsPage';
import ActivitiesPage from './components/ActivitiesPage';
import FollowupsPage from './components/FollowupsPage';
import AnalyticsPage from './components/AnalyticsPage';
import LeadReport from './components/LeadReport';
import DealReport from './components/DealReport';
import ContactReportsPage from './components/ContactReportsPage';
import CompanyReportsPage from './components/CompanyReportsPage';
import ProjectReportsPage from './components/ProjectReportsPage';
import TaskReportsPage from './components/TaskReportsPage';
import ContactDetailsPage from './components/ContactDetailsPage';
import RolesPermissionsPage from './components/RolesPermissionsPage';
import DeleteAccountRequestPage from './components/DeleteAccountRequestPage';
import MembershipPlansPage from './components/MembershipPlansPage';
import MembershipAddonsPage from './components/MembershipAddonsPage';
import MembershipTransactionsPage from './components/MembershipTransactionsPage';
import PagesPage from './components/PagesPage';
import AllBlogsPage from './components/AllBlogsPage';
import BlogCategoriesPage from './components/BlogCategoriesPage';
import BlogCommentsPage from './components/BlogCommentsPage';
import BlogTagsPage from './components/BlogTagsPage';
import ManageUsersPage from './components/ManageUsersPage';
import RolePermissionsDetailPage from './components/RolePermissionsDetailPage';
import TaskDetailsPage from './components/TaskDetailsPage';
import LeadDetailsPage from './components/LeadDetailsPage';
import LeadDistributionPage from './components/LeadDistributionPage';
import DealsKanbanBoard from './components/DealsKanbanBoard';
import DealDetailsPage from './components/DealDetailsPage';
import QuotationsPage from './components/QuotationsPage';
import CustomersPage from './components/CustomersPage';
import SalesTargetsPage from './components/SalesTargetsPage';
import PerformancePage from './components/PerformancePage';
import CommissionPage from './components/CommissionPage';
import ApprovalsPage from './components/ApprovalsPage';
import SalesReportsPage from './components/SalesReportsPage';
import NotificationsPage from './components/NotificationsPage';
import ProfileSettingsPage from './components/ProfileSettingsPage';
import DepartmentsPage from './components/DepartmentsPage';
import AutomationRulesPage from './components/AutomationRulesPage';

// Shared modules across departments
const SHARED_MODULES = [
  'calendar', 'tasks', 'followups', 'analytics', 'reports', 
  'dashboard', 'list', 'details', 'kanban', 'quotations', 
  'customers', 'targets', 'performance', 'commission', 'distribution',
  'contacts', 'companies', 'campaign', 'proposals', 'contracts', 
  'estimations', 'invoices', 'payments', 'activities', 'chat',
  'video-call', 'audio-call', 'call-history', 'email', 'todo', 
  'notes', 'file-manager', 'social-feed'
];

const DEPARTMENTS = ['deals', 'leads', 'projects', 'sales', 'super-admin'];

const routeMap = {
  '/': 'dashboard-router',
  ...DEPARTMENTS.reduce((acc, dept) => {
    SHARED_MODULES.forEach(module => {
      acc[`/${dept}/${module}`] = module === 'dashboard' ? `${dept}-dashboard` : module;
    });
    return acc;
  }, {}),
  
  // Custom overrides for mapping
  '/deals/dashboard': 'deals-dashboard',
  '/leads/dashboard': 'leads-dashboard',
  '/sales/dashboard': 'sales-dashboard',
  '/projects/dashboard': 'projects-dashboard',
  '/deals/list': 'deals-list',
  '/leads/list': 'leads',
  '/projects/list': 'projects',
  '/projects/details': 'project-details',
  '/deals/kanban': 'deals-kanban',
  '/sales/targets': 'sales-targets',
  '/sales/reports': 'sales-reports',
  
  // Specific routes
  '/deals/deal/:id': 'deal-details',
  '/leads/lead/:id': 'lead-details',
  '/lead/:id': 'lead-details',
  '/task/:taskId': 'task-details',
  '/payment/:invoiceId': 'payment-details',
  
  // Global / Shared
  '/notifications': 'notifications',
  '/profile-settings': 'profile-settings',
  '/departments': 'departments',
  '/automation-rules': 'automation-rules',
  '/contacts': 'contacts',
  '/contact-details': 'contact-details',
  '/companies': 'companies',
  '/add-company': 'add-company',
  '/company-details': 'company-details',
  '/pipeline': 'pipeline',
  '/campaign': 'campaign',
  '/estimations': 'estimations',
  '/chat': 'chat',
  '/video-call': 'video-call',
  '/audio-call': 'audio-call',
  '/call-history': 'call-history',
  '/email': 'email',
  '/todo': 'todo',
  '/tasks': 'tasks',
  '/proposals': 'proposals',
  '/contracts': 'contracts',
  '/notes': 'notes',
  '/file-manager': 'file-manager',
  '/social-feed': 'social-feed',
  '/kanban': 'kanban',
  '/invoices': 'invoices',
  '/payments': 'payments',
  '/activities': 'activities',
  '/followups': 'followups',
  '/analytics': 'analytics',
  '/lead-report': 'lead-report',
  '/deal-report': 'deal-report',
  '/contact-report': 'contact-report',
  '/company-report': 'company-report',
  '/project-report': 'project-report',
  '/task-report': 'task-report',
  '/manage-users': 'manage-users',
  '/roles-permissions': 'roles-permissions',
  '/role-permissions-detail': 'role-permissions-detail',
  '/delete-request': 'delete-request',
  '/membership': 'membership',
  '/membership-plans': 'membership-plans',
  '/membership-addons': 'membership-addons',
  '/membership-transactions': 'membership-transactions',
  '/pages': 'pages',
  '/all-blogs': 'all-blogs',
  '/blog-categories': 'blog-categories',
  '/blog-comments': 'blog-comments',
  '/blog-tags': 'blog-tags',
  '/blog': 'blog',
  '/location': 'location',
  '/testimonials': 'testimonials',
  '/faq': 'faq',
  
  // Super Admin
  '/super-admin': 'super-admin',
  '/super-admin/companies': 'super-admin-companies',
  '/super-admin/subscriptions': 'super-admin-subscriptions',
  '/super-admin/packages': 'super-admin-packages',
  '/super-admin/domain': 'super-admin-domain',
  '/super-admin/purchase-transaction': 'super-admin-purchase-transaction',
};

const DashboardRouter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'Super Admin') {
      navigate('/super-admin');
    } else if (user.role === 'Admin' || user.department === 'Leads Management') {
      navigate('/leads/dashboard');
    } else if (user.department === 'Deals Management') {
      navigate('/deals/dashboard');
    } else if (user.role === 'Sales Manager' || user.role === 'Sales Executive' || user.department === 'Sales Department') {
      navigate('/sales/dashboard');
    } else if (user.department === 'Marketing Department' || user.department === 'IT Department') {
      navigate('/projects/dashboard');
    } else if (user.department === 'Accounting Department') {
      navigate('/invoices');
    } else {
      navigate('/deals/dashboard');
    }
  }, [user, navigate]);

  return null;
};

const NavigateToLead = () => {
  const { id } = useParams();
  return <Navigate to={`/leads/lead/${id}`} replace />;
};

function AppContent() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Resolve current page for sidebar highlighting
  const getPageFromPath = (pathname) => {
    // Handle dynamic routes by stripping IDs
    const cleanPath = pathname.split('/').map(part => {
      // If it looks like an ID (numeric or UUID-ish), replace with :id
      if (/^\d+$/.test(part) || (part.length > 20 && part.includes('-'))) {
        return ':id';
      }
      return part;
    }).join('/');
    
    return routeMap[cleanPath] || routeMap[pathname] || 'deals-dashboard';
  };

  const currentPage = getPageFromPath(location.pathname);
  const isVideoCall = location.pathname.includes('/video-call');

  useEffect(() => {
    if (location.state?.company) {
      setSelectedCompany(location.state.company);
    }
  }, [location.state?.company]);

  const handleViewProjectDetails = (projectId) => {
    setSelectedProjectId(projectId);
    navigate('/projects/details');
  };

  const handleBackFromProjectDetails = () => {
    setSelectedProjectId(null);
    navigate('/projects/dashboard');
  };

  const handleViewCompanyDetails = (company) => {
    setSelectedCompany(company);
    navigate('/company-details');
  };

  const handleBackFromCompanyDetails = () => {
    setSelectedCompany(null);
    navigate('/companies');
  };

  const handleBackFromContactDetails = () => {
    setSelectedContactId(null);
    navigate('/contacts');
  };

  const handleViewDealDetails = (deal) => {
    setSelectedDealId(deal.id);
    navigate(`/deals/deal/${deal.id}`);
  };

  const handleBackFromDealDetails = () => {
    setSelectedDealId(null);
    navigate('/deals/kanban');
  };

  const handleNavigate = (page) => {
    // If it's already a path, use it directly
    if (page.startsWith('/')) {
      navigate(page);
      return;
    }
    const routePath = Object.keys(routeMap).find(path => routeMap[path] === page) || '/';
    navigate(routePath);
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={handleNavigate}
      hideSidebar={isVideoCall}
      hideHeader={isVideoCall}
    >
      <Routes>
        <Route path="/" element={<DashboardRouter />} />
        <Route path="/deals/dashboard" element={<DealsDashboard />} />
        <Route path="/deals/kanban" element={<DealsKanbanBoard onDealClick={handleViewDealDetails} />} />
        <Route path="/deals/deal/:id" element={<LeadDetailsPage />} />
        <Route path="/sales/dashboard" element={<SalesDashboard />} />
        <Route path="/sales/quotations" element={<QuotationsPage />} />
        <Route path="/sales/customers" element={<CustomersPage />} />
        <Route path="/sales/targets" element={<SalesTargetsPage />} />
        <Route path="/sales/performance" element={<PerformancePage />} />
        <Route path="/sales/commission" element={<CommissionPage />} />
        <Route path="/sales/approvals" element={<ApprovalsPage />} />
        <Route path="/sales/reports" element={<SalesReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile-settings" element={<ProfileSettingsPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/automation-rules" element={<AutomationRulesPage />} />
        <Route path="/leads/dashboard" element={<LeadsDashboard />} />
        <Route path="/projects/dashboard" element={<ProjectsDashboard onViewProjectDetails={handleViewProjectDetails} onViewCompanyDetails={handleViewCompanyDetails} />} />
        <Route path="/projects/details" element={<ProjectDetailsPage projectId={selectedProjectId} onBack={handleBackFromProjectDetails} />} />
        <Route path="/deals/list" element={<CrmDealsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/contact-details" element={<ContactDetailsPage contactId={selectedContactId} onBack={handleBackFromContactDetails} />} />
        <Route path="/companies" element={<CrmCompaniesPage />} />
        <Route path="/add-company" element={<AddCompanyPage />} />
        <Route path="/company-details" element={<CompanyDetailsPage company={selectedCompany} onBack={handleBackFromCompanyDetails} />} />
        <Route path="/leads/list" element={<CrmLeadsPage />} />
        <Route path="/leads/distribution" element={<LeadDistributionPage />} />
        <Route path="/leads/lead/:id" element={<LeadDetailsPage />} />
        <Route path="/lead/:id" element={<NavigateToLead />} />
        <Route path="/task/:taskId" element={<TaskDetailsPage />} />
        <Route path="/pipeline" element={<CrmPipelinePage />} />
        <Route path="/campaign" element={<CrmCampaignPage />} />
        <Route path="/projects/list" element={<CrmProjectsPage />} />
        <Route path="/estimations" element={<EstimationsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/video-call" element={<VideoCallPage />} />
        <Route path="/video-call/:code" element={<VideoCallPage />} />
        <Route path="/audio-call" element={<AudioCallPage />} />
        <Route path="/call-history" element={<CallHistoryPage />} />
        
        {/* Dynamic calendar routes based on department */}
        <Route path="/deals/calendar" element={<CalendarPage />} />
        <Route path="/leads/calendar" element={<CalendarPage />} />
        <Route path="/projects/calendar" element={<CalendarPage />} />
        <Route path="/sales/calendar" element={<CalendarPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        
        {/* Dynamic tasks routes based on department */}
        <Route path="/deals/tasks" element={<TasksPage />} />
        <Route path="/leads/tasks" element={<TasksPage />} />
        <Route path="/projects/tasks" element={<TasksPage />} />
        <Route path="/sales/tasks" element={<TasksPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        
        {/* Dynamic followups routes based on department */}
        <Route path="/deals/followups" element={<FollowupsPage />} />
        <Route path="/leads/followups" element={<FollowupsPage />} />
        <Route path="/projects/followups" element={<FollowupsPage />} />
        <Route path="/sales/followups" element={<FollowupsPage />} />
        <Route path="/followups" element={<FollowupsPage />} />
        
        {/* Dynamic analytics/reports routes based on department */}
        <Route path="/deals/analytics" element={<AnalyticsPage />} />
        <Route path="/leads/analytics" element={<AnalyticsPage />} />
        <Route path="/projects/analytics" element={<AnalyticsPage />} />
        <Route path="/sales/analytics" element={<AnalyticsPage />} />
        <Route path="/deals/reports" element={<AnalyticsPage />} />
        <Route path="/leads/reports" element={<AnalyticsPage />} />
        <Route path="/projects/reports" element={<AnalyticsPage />} />
        <Route path="/sales/reports" element={<SalesReportsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        
        {/* Dynamic routes for shared modules across departments */}
        {['deals', 'leads', 'projects', 'sales', 'super-admin'].map(dept => (
          <React.Fragment key={dept}>
            <Route path={`/${dept}/contacts`} element={<ContactsPage />} />
            <Route path={`/${dept}/companies`} element={<CrmCompaniesPage />} />
            <Route path={`/${dept}/campaign`} element={<CrmCampaignPage />} />
            <Route path={`/${dept}/proposals`} element={<ProposalsPage />} />
            <Route path={`/${dept}/contracts`} element={<ContractsPage />} />
            <Route path={`/${dept}/estimations`} element={<EstimationsPage />} />
            <Route path={`/${dept}/invoices`} element={<InvoicesPage />} />
            <Route path={`/${dept}/payments`} element={<PaymentsPage />} />
            <Route path={`/${dept}/activities`} element={<ActivitiesPage />} />
            <Route path={`/${dept}/chat`} element={<ChatPage />} />
            <Route path={`/${dept}/video-call`} element={<VideoCallPage />} />
            <Route path={`/${dept}/audio-call`} element={<AudioCallPage />} />
            <Route path={`/${dept}/call-history`} element={<CallHistoryPage />} />
            <Route path={`/${dept}/email`} element={<EmailPage />} />
            <Route path={`/${dept}/todo`} element={<TodoPage />} />
            <Route path={`/${dept}/notes`} element={<NotesPage />} />
            <Route path={`/${dept}/file-manager`} element={<FileManagerPage />} />
            <Route path={`/${dept}/social-feed`} element={<SocialFeedPage />} />
            <Route path={`/${dept}/kanban`} element={<KanbanPage />} />
            <Route path={`/${dept}/list`} element={
              dept === 'leads' ? <CrmLeadsPage /> : 
              dept === 'projects' ? <CrmProjectsPage /> : 
              <CrmDealsPage />
            } />
            <Route path={`/${dept}/details`} element={<ProjectDetailsPage />} />
            <Route path={`/${dept}/customers`} element={<CustomersPage />} />
            <Route path={`/${dept}/quotations`} element={<QuotationsPage />} />
            <Route path={`/${dept}/targets`} element={<SalesTargetsPage />} />
            <Route path={`/${dept}/performance`} element={<PerformancePage />} />
            <Route path={`/${dept}/commission`} element={<CommissionPage />} />
            <Route path={`/${dept}/distribution`} element={<LeadDistributionPage />} />
          </React.Fragment>
        ))}
        
        <Route path="/email" element={<EmailPage />} />
        <Route path="/todo" element={<TodoPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/proposals" element={<ProposalsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/file-manager" element={<FileManagerPage />} />
        <Route path="/social-feed" element={<SocialFeedPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payment/:invoiceId" element={<PaymentDetailsPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/followups" element={<FollowupsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/lead-report" element={<LeadReport />} />
        <Route path="/deal-report" element={<DealReport />} />
        <Route path="/contact-report" element={<ContactReportsPage />} />
        <Route path="/company-report" element={<CompanyReportsPage />} />
        <Route path="/project-report" element={<ProjectReportsPage />} />
        <Route path="/task-report" element={<TaskReportsPage />} />
        <Route path="/manage-users" element={<ManageUsersPage />} />
        <Route path="/roles-permissions" element={<RolesPermissionsPage />} />
        <Route path="/role-permissions-detail" element={<RolePermissionsDetailPage />} />
        <Route path="/delete-request" element={<DeleteAccountRequestPage />} />
        <Route path="/membership" element={<MembershipPlansPage />} />
        <Route path="/membership-plans" element={<MembershipPlansPage />} />
        <Route path="/membership-addons" element={<MembershipAddonsPage />} />
        <Route path="/membership-transactions" element={<MembershipTransactionsPage />} />
        <Route path="/pages" element={<PagesPage />} />
        <Route path="/all-blogs" element={<AllBlogsPage />} />
        <Route path="/blog-categories" element={<BlogCategoriesPage />} />
        <Route path="/blog-comments" element={<BlogCommentsPage />} />
        <Route path="/blog-tags" element={<BlogTagsPage />} />
        <Route path="/blog" element={<AllBlogsPage />} />
        <Route path="/location" element={<div className="p-2 bg-[#F7F8F9] min-h-screen"><div className="bg-white rounded p-3 "><h1 className="text-2xl  mb-4">Location</h1><p className="text-gray-600">Location page coming soon...</p></div></div>} />
        <Route path="/testimonials" element={<div className="p-2 bg-[#F7F8F9] min-h-screen"><div className="bg-white rounded p-3 "><h1 className="text-2xl  mb-4">Testimonials</h1><p className="text-gray-600">Testimonials page coming soon...</p></div></div>} />
        <Route path="/faq" element={<div className="p-2 bg-[#F7F8F9] min-h-screen"><div className="bg-white rounded p-3 "><h1 className="text-2xl  mb-4">FAQ</h1><p className="text-gray-600">FAQ page coming soon...</p></div></div>} />
        
        {/* Super Admin routes with new paths */}
        <Route path="/super-admin" element={<ProtectedRoute requiredRoles="Super Admin"><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/super-admin/companies" element={<ProtectedRoute requiredRoles="Super Admin"><Companies /></ProtectedRoute>} />
        <Route path="/super-admin/subscriptions" element={<ProtectedRoute requiredRoles="Super Admin"><Subscriptions /></ProtectedRoute>} />
        <Route path="/super-admin/packages" element={<ProtectedRoute requiredRoles="Super Admin"><Packages /></ProtectedRoute>} />
        <Route path="/super-admin/domain" element={<ProtectedRoute requiredRoles="Super Admin"><Domain /></ProtectedRoute>} />
        <Route path="/super-admin/purchase-transaction" element={<ProtectedRoute requiredRoles="Super Admin"><PurchaseTransaction /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

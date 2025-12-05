import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
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
import EstimationsPage from './components/EstimationsPage';
import ActivitiesPage from './components/ActivitiesPage';
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
import LeadDetailsPage from './components/LeadDetailsPage';
import DealsKanbanBoard from './components/DealsKanbanBoard';
import DealDetailsPage from './components/DealDetailsPage';

const routeMap = {
  '/': 'deals',
  '/deals': 'deals',
  '/deals-kanban': 'deals-kanban',
  '/deal/:id': 'deal-details',
  '/leads-dashboard': 'leads-dashboard',
  '/projects-dashboard': 'projects-dashboard',
  '/project-details': 'project-details',
  '/deals-list': 'deals-list',
  '/contacts': 'contacts',
  '/contact-details': 'contact-details',
  '/companies': 'companies',
  '/add-company': 'add-company',
  '/company-details': 'company-details',
  '/leads': 'leads',
  '/pipeline': 'pipeline',
  '/campaign': 'campaign',
  '/projects': 'projects',
  '/estimations': 'estimations',
  '/chat': 'chat',
  '/video-call': 'video-call',
  '/audio-call': 'audio-call',
  '/call-history': 'call-history',
  '/calendar': 'calendar',
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
  '/payment/:invoiceId': 'payment-details',
  '/activities': 'activities',
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
  '/super-admin': 'super-admin',
  '/super-admin-companies': 'super-admin-companies',
  '/super-admin-subscriptions': 'super-admin-subscriptions',
  '/super-admin-packages': 'super-admin-packages',
  '/super-admin-domain': 'super-admin-domain',
  '/super-admin-purchase-transaction': 'super-admin-purchase-transaction',
};

function AppContent() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = routeMap[location.pathname] || 'deals';

  useEffect(() => {
    if (location.state?.company) {
      setSelectedCompany(location.state.company);
    }
  }, [location.state?.company]);

  const handleViewProjectDetails = (projectId) => {
    setSelectedProjectId(projectId);
    navigate('/project-details');
  };

  const handleBackFromProjectDetails = () => {
    setSelectedProjectId(null);
    navigate('/projects-dashboard');
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
    navigate(`/deal/${deal.id}`);
  };

  const handleBackFromDealDetails = () => {
    setSelectedDealId(null);
    navigate('/deals-kanban');
  };

  const handleNavigate = (page) => {
    const routePath = Object.keys(routeMap).find(path => routeMap[path] === page) || '/';
    navigate(routePath);
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      <Routes>
        <Route path="/" element={<DealsDashboard />} />
        <Route path="/deals" element={<DealsDashboard />} />
        <Route path="/deals-kanban" element={<DealsKanbanBoard onDealClick={handleViewDealDetails} />} />
        <Route path="/deal/:id" element={<DealDetailsPage dealId={selectedDealId} onBack={handleBackFromDealDetails} />} />
        <Route path="/leads-dashboard" element={<LeadsDashboard />} />
        <Route path="/projects-dashboard" element={<ProjectsDashboard onViewProjectDetails={handleViewProjectDetails} onViewCompanyDetails={handleViewCompanyDetails} />} />
        <Route path="/project-details" element={<ProjectDetailsPage projectId={selectedProjectId} onBack={handleBackFromProjectDetails} />} />
        <Route path="/deals-list" element={<CrmDealsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/contact-details" element={<ContactDetailsPage contactId={selectedContactId} onBack={handleBackFromContactDetails} />} />
        <Route path="/companies" element={<CrmCompaniesPage />} />
        <Route path="/add-company" element={<AddCompanyPage />} />
        <Route path="/company-details" element={<CompanyDetailsPage company={selectedCompany} onBack={handleBackFromCompanyDetails} />} />
        <Route path="/leads" element={<CrmLeadsPage />} />
        <Route path="/lead/:id" element={<LeadDetailsPage />} />
        <Route path="/pipeline" element={<CrmPipelinePage />} />
        <Route path="/campaign" element={<CrmCampaignPage />} />
        <Route path="/projects" element={<CrmProjectsPage />} />
        <Route path="/estimations" element={<EstimationsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/video-call" element={<VideoCallPage />} />
        <Route path="/audio-call" element={<AudioCallPage />} />
        <Route path="/call-history" element={<CallHistoryPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
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
        <Route path="/location" element={<div className="p-6 bg-gray-50 min-h-screen"><div className="bg-white rounded-lg p-6"><h1 className="text-2xl font-bold mb-4">Location</h1><p className="text-gray-600">Location page coming soon...</p></div></div>} />
        <Route path="/testimonials" element={<div className="p-6 bg-gray-50 min-h-screen"><div className="bg-white rounded-lg p-6"><h1 className="text-2xl font-bold mb-4">Testimonials</h1><p className="text-gray-600">Testimonials page coming soon...</p></div></div>} />
        <Route path="/faq" element={<div className="p-6 bg-gray-50 min-h-screen"><div className="bg-white rounded-lg p-6"><h1 className="text-2xl font-bold mb-4">FAQ</h1><p className="text-gray-600">FAQ page coming soon...</p></div></div>} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/super-admin-companies" element={<Companies />} />
        <Route path="/super-admin-subscriptions" element={<Subscriptions />} />
        <Route path="/super-admin-packages" element={<Packages />} />
        <Route path="/super-admin-domain" element={<Domain />} />
        <Route path="/super-admin-purchase-transaction" element={<PurchaseTransaction />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

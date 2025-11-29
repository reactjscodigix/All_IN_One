import React, { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import DealsDashboard from './components/DealsDashboard';
import LeadsDashboard from './components/LeadsDashboard';
import ProjectsDashboard from './components/ProjectsDashboard';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import ContactsPage from './components/ContactsPage';
import CrmCompaniesPage from './components/CrmCompaniesPage';
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

function App() {
  const [currentPage, setCurrentPage] = useState('deals');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleViewProjectDetails = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project-details');
  };

  const handleBackFromProjectDetails = () => {
    setSelectedProjectId(null);
    setCurrentPage('projects-dashboard');
  };

  const handleViewCompanyDetails = (company) => {
    setSelectedCompany(company);
    setCurrentPage('company-details');
  };

  const handleBackFromCompanyDetails = () => {
    setSelectedCompany(null);
    setCurrentPage('companies');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'deals':
        return <DealsDashboard />;
      case 'leads-dashboard':
        return <LeadsDashboard />;
      case 'projects-dashboard':
        return (
          <ProjectsDashboard
            onViewProjectDetails={handleViewProjectDetails}
            onViewCompanyDetails={handleViewCompanyDetails}
          />
        );
      case 'project-details':
        return <ProjectDetailsPage projectId={selectedProjectId} onBack={handleBackFromProjectDetails} />;
      case 'deals-list':
        return <CrmDealsPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'companies':
        return <CrmCompaniesPage />;
      case 'company-details':
        return <CompanyDetailsPage company={selectedCompany} onBack={handleBackFromCompanyDetails} />;
      case 'leads':
        return <CrmLeadsPage />;
      case 'pipeline':
        return <CrmPipelinePage />;
      case 'campaign':
        return <CrmCampaignPage />;
      case 'projects':
        return <CrmProjectsPage />;
      case 'estimations':
        return <EstimationsPage />;
      case 'chat':
        return <ChatPage />;
      case 'video-call':
        return <VideoCallPage />;
      case 'audio-call':
        return <AudioCallPage />;
      case 'call-history':
        return <CallHistoryPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'email':
        return <EmailPage />;
      case 'todo':
        return <TodoPage />;
      case 'tasks':
        return <TasksPage />;
      case 'proposals':
        return <ProposalsPage />;
      case 'contracts':
        return <ContractsPage />;
      case 'notes':
        return <NotesPage />;
      case 'file-manager':
        return <FileManagerPage />;
      case 'social-feed':
        return <SocialFeedPage />;
      case 'kanban':
        return <KanbanPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'activities':
        return <ActivitiesPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'lead-report':
        return <LeadReport />;
      case 'deal-report':
        return <DealReport />;
      case 'super-admin':
        return <SuperAdminDashboard />;
      case 'super-admin-companies':
        return <Companies />;
      case 'super-admin-subscriptions':
        return <Subscriptions />;
      case 'super-admin-packages':
        return <Packages />;
      case 'super-admin-domain':
        return <Domain />;
      case 'super-admin-purchase-transaction':
        return <PurchaseTransaction />;
      default:
        return <DealsDashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;

import React, { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import DealsDashboard from './components/DealsDashboard';
import LeadsDashboard from './components/LeadsDashboard';
import ProjectsDashboard from './components/ProjectsDashboard';
import ProjectDetailsPage from './components/ProjectDetailsPage';
import DealsListPage from './components/DealsListPage';
import ContactsPage from './components/ContactsPage';
import CompaniesPage from './components/CompaniesPage';
import CompanyDetailsPage from './components/CompanyDetailsPage';
import PipelinePage from './components/PipelinePage';
import ChatPage from './components/ChatPage';
import VideoCallPage from './components/VideoCallPage';
import AudioCallPage from './components/AudioCallPage';
import CallHistoryPage from './components/CallHistoryPage';
import CalendarPage from './components/CalendarPage';
import EmailPage from './components/EmailPage';
import TodoPage from './components/TodoPage';
import NotesPage from './components/NotesPage';
import FileManagerPage from './components/FileManagerPage';
import SocialFeedPage from './components/SocialFeedPage';
import KanbanPage from './components/KanbanPage';
import InvoicesPage from './components/InvoicesPage';

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
        return <DealsListPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'companies':
        return <CompaniesPage onViewCompanyDetails={handleViewCompanyDetails} />;
      case 'company-details':
        return <CompanyDetailsPage company={selectedCompany} onBack={handleBackFromCompanyDetails} />;
      case 'leads':
        return <LeadsDashboard />;
      case 'pipeline':
        return <PipelinePage />;
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

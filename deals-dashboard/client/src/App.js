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
import PipelinePage from './components/PipelinePage';
import ChatPage from './components/ChatPage';

function App() {
  const [currentPage, setCurrentPage] = useState('deals');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleViewProjectDetails = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project-details');
  };

  const handleBackFromProjectDetails = () => {
    setSelectedProjectId(null);
    setCurrentPage('projects-dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'deals':
        return <DealsDashboard />;
      case 'leads-dashboard':
        return <LeadsDashboard />;
      case 'projects-dashboard':
        return <ProjectsDashboard onViewProjectDetails={handleViewProjectDetails} />;
      case 'project-details':
        return <ProjectDetailsPage projectId={selectedProjectId} onBack={handleBackFromProjectDetails} />;
      case 'deals-list':
        return <DealsListPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'companies':
        return <CompaniesPage />;
      case 'leads':
        return <LeadsDashboard />;
      case 'pipeline':
        return <PipelinePage />;
      case 'chat':
        return <ChatPage />;
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

import React, { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import DealsDashboard from './components/DealsDashboard';
import LeadsDashboard from './components/LeadsDashboard';
import ProjectsDashboard from './components/ProjectsDashboard';
import DealsListPage from './components/DealsListPage';
import ContactsPage from './components/ContactsPage';
import CompaniesPage from './components/CompaniesPage';
import PipelinePage from './components/PipelinePage';

function App() {
  const [currentPage, setCurrentPage] = useState('deals');

  const renderPage = () => {
    switch (currentPage) {
      case 'deals':
        return <DealsDashboard />;
      case 'leads-dashboard':
        return <LeadsDashboard />;
      case 'projects-dashboard':
        return <ProjectsDashboard />;
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

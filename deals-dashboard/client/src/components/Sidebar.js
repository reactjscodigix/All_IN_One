import React, { useState } from 'react';
import { ChevronDown, X, Home, Users, Building2, Settings, BarChart3, FileText, Briefcase, MessageCircle, Shield, Trash2, Users2, FileJson, MapPin, MessageSquare, HelpCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isSidebarItemVisible } from '../utils/roleBasedAccess';

const Sidebar = ({ isOpen, toggleSidebar, onNavigate, currentPage }) => {
  const { user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({
    dashboard: true,
    applications: false,
    call: false,
    superAdmin: false,
    crm: true,
    reports: true,
    crmSettings: false,
    userManagement: false,
    settings: false,
    membership: false,
    content: false,
    blog: false,
    location: false,
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const SubmenuItem = ({ icon: Icon, label, onClick, active, page }) => (
    <button
      onClick={() => {
        onNavigate(page);
        if (toggleSidebar) toggleSidebar();
      }}
      className={`menu-item w-full flex items-center gap-3 px-6 py-2 text-sm rounded-md transition-smooth ${
        currentPage === page
          ? 'bg-red-50 text-red-600 font-semibold shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className={`w-1 h-1 rounded-full bg-current transition-transform ${currentPage === page ? 'scale-125' : ''}`}></span>
      <span>{label}</span>
    </button>
  );

  const MenuSection = ({ title, items, expanded, onToggle }) => (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className="menu-item w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase hover:bg-gray-50 hover:text-gray-700 rounded-md transition-smooth"
      >
        <span>{title}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && <div className="space-y-1 animate-fade-in">{items}</div>}
    </div>
  );

  const mainMenuItems = (
    <>
      <SubmenuItem icon={Home} label="Deals Dashboard" page="deals" />
      <SubmenuItem icon={Users} label="Leads Dashboard" page="leads-dashboard" />
      <SubmenuItem icon={Briefcase} label="Project Dashboard" page="projects-dashboard" />
    </>
  );

  const callItems = (
    <>
      <SubmenuItem icon={Home} label="Video Call" page="video-call" />
      <SubmenuItem icon={Home} label="Audio Call" page="audio-call" />
      <SubmenuItem icon={Home} label="Call History" page="call-history" />
    </>
  );

  const applicationsItems = (
    <>
      <SubmenuItem icon={MessageCircle} label="Chat" page="chat" />
      <MenuSection
        title="Call"
        items={callItems}
        expanded={expandedMenus.call}
        onToggle={() => toggleMenu('call')}
      />
      <SubmenuItem icon={Home} label="Calendar" page="calendar" />
      <SubmenuItem icon={Home} label="Email" page="email" />
      <SubmenuItem icon={Home} label="To Do" page="todo" />
      <SubmenuItem icon={Home} label="Notes" page="notes" />
      <SubmenuItem icon={Home} label="File Manager" page="file-manager" />
      <SubmenuItem icon={Home} label="Social Feed" page="social-feed" />
      <SubmenuItem icon={Home} label="Kanban" page="kanban" />
      <SubmenuItem icon={Home} label="Invoices" page="invoices" />
    </>
  );

  const crmMenuItems = (
    <>
      <SubmenuItem icon={Users} label="Contacts" page="contacts" />
      <SubmenuItem icon={Building2} label="Companies" page="companies" />
      <SubmenuItem icon={FileText} label="Deals" page="deals-list" />
      <SubmenuItem icon={Users} label="Leads" page="leads" />
      <SubmenuItem icon={Briefcase} label="Pipeline" page="pipeline" />
      <SubmenuItem icon={FileText} label="Campaign" page="campaign" />
      <SubmenuItem icon={FileText} label="Projects" page="projects" />
      <SubmenuItem icon={FileText} label="Tasks" page="tasks" />
      <SubmenuItem icon={FileText} label="Proposals" page="proposals" />
      <SubmenuItem icon={FileText} label="Contracts" page="contracts" />
      <SubmenuItem icon={FileText} label="Estimations" page="estimations" />
      <SubmenuItem icon={FileText} label="Invoices" page="invoices" />
      <SubmenuItem icon={FileText} label="Payments" page="payments" />
      <SubmenuItem icon={BarChart3} label="Analytics" page="analytics" />
      <SubmenuItem icon={FileText} label="Activities" page="activities" />
    </>
  );

  const reportsItems = (
    <>
      <SubmenuItem icon={BarChart3} label="Lead Reports" page="lead-report" />
      <SubmenuItem icon={BarChart3} label="Deal Reports" page="deal-report" />
      <SubmenuItem icon={BarChart3} label="Contact Reports" page="contact-report" />
      <SubmenuItem icon={BarChart3} label="Company Reports" page="company-report" />
      <SubmenuItem icon={BarChart3} label="Project Reports" page="project-report" />
      <SubmenuItem icon={BarChart3} label="Task Reports" page="task-report" />
    </>
  );

  const userManagementItems = (
    <>
      <button
        onClick={() => {
          onNavigate('manage-users');
          if (toggleSidebar) toggleSidebar();
        }}
        className={`menu-item w-full flex items-center gap-3 px-6 py-2 text-sm rounded-md transition-smooth ${
          currentPage === 'manage-users'
            ? 'bg-red-100 text-red-600 font-semibold shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className={`w-6 h-6 rounded flex items-center justify-center ${currentPage === 'manage-users' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
          <Users size={16} />
        </div>
        <span>Manage Users</span>
      </button>
      <SubmenuItem icon={Shield} label="Roles & Permissions" page="roles-permissions" />
      <SubmenuItem icon={Trash2} label="Delete Request" page="delete-request" />
    </>
  );

  const membershipItems = (
    <>
      <SubmenuItem icon={Users2} label="Membership Plans" page="membership-plans" />
      <SubmenuItem icon={Users2} label="Membership Addons" page="membership-addons" />
      <SubmenuItem icon={Users2} label="Membership Transactions" page="membership-transactions" />
    </>
  );

  const blogItems = (
    <>
      <SubmenuItem icon={FileJson} label="All Blogs" page="all-blogs" />
      <SubmenuItem icon={FileJson} label="Blog Categories" page="blog-categories" />
      <SubmenuItem icon={FileJson} label="Blog Comments" page="blog-comments" />
      <SubmenuItem icon={FileJson} label="Blog Tags" page="blog-tags" />
    </>
  );

  const locationItems = (
    <>
      <SubmenuItem icon={MapPin} label="Location" page="location" />
    </>
  );

  const contentItems = (
    <>
      <SubmenuItem icon={FileText} label="Pages" page="pages" />
      <MenuSection
        title="Blog"
        items={blogItems}
        expanded={expandedMenus.blog}
        onToggle={() => toggleMenu('blog')}
      />
      <MenuSection
        title="Location"
        items={locationItems}
        expanded={expandedMenus.location}
        onToggle={() => toggleMenu('location')}
      />
      <SubmenuItem icon={MessageSquare} label="Testimonials" page="testimonials" />
      <SubmenuItem icon={HelpCircle} label="FAQ" page="faq" />
    </>
  );

  const settingsItems = (
    <>
      <SubmenuItem icon={Settings} label="General Settings" />
      <SubmenuItem icon={Settings} label="Website Settings" />
      <SubmenuItem icon={Settings} label="System Settings" />
      <SubmenuItem icon={Settings} label="Financial Settings" />
    </>
  );

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-border-light overflow-y-auto transition-smooth z-40 shadow-lg ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:shadow-none`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border-light flex items-center justify-between hover-lift transition-smooth">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold hover-lift">
              P
            </div>
            <span className="font-bold text-lg text-gray-900">Preadmin</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="icon-btn lg:hidden p-1 hover:bg-gray-100 rounded transition-smooth"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Content */}
        <div className="p-4 space-y-6">
          {/* Main Menu */}
          <MenuSection
            title="Main Menu"
            items={mainMenuItems}
            expanded={expandedMenus.dashboard}
            onToggle={() => toggleMenu('dashboard')}
          />

          {/* Applications */}
          {isSidebarItemVisible(user?.role, 'applications') && (
            <MenuSection
              title="Applications"
              items={applicationsItems}
              expanded={expandedMenus.applications}
              onToggle={() => toggleMenu('applications')}
            />
          )}

          {/* Super Admin */}
          {isSidebarItemVisible(user?.role, 'superAdmin') && (
            <MenuSection
              title="Super Admin"
              items={
                <>
                  <SubmenuItem icon={Home} label="Dashboard" page="super-admin" />
                  <SubmenuItem icon={Building2} label="Companies" page="super-admin-companies" />
                  <SubmenuItem icon={FileText} label="Subscriptions" page="super-admin-subscriptions" />
                  <SubmenuItem icon={Briefcase} label="Packages" page="super-admin-packages" />
                  <SubmenuItem icon={Building2} label="Domain" page="super-admin-domain" />
                  <SubmenuItem icon={FileText} label="Purchase Transaction" page="super-admin-purchase-transaction" />
                </>
              }
              expanded={expandedMenus.superAdmin}
              onToggle={() => toggleMenu('superAdmin')}
            />
          )}

          {/* CRM Section */}
          {isSidebarItemVisible(user?.role, 'crm') && (
            <MenuSection
              title="CRM"
              items={crmMenuItems}
              expanded={expandedMenus.crm}
              onToggle={() => toggleMenu('crm')}
            />
          )}

          {/* Reports Section */}
          {isSidebarItemVisible(user?.role, 'reports') && (
            <MenuSection
              title="Reports"
              items={reportsItems}
              expanded={expandedMenus.reports}
              onToggle={() => toggleMenu('reports')}
            />
          )}

          {/* User Management Section */}
          {isSidebarItemVisible(user?.role, 'userManagement') && (
            <MenuSection
              title="User Management"
              items={userManagementItems}
              expanded={expandedMenus.userManagement}
              onToggle={() => toggleMenu('userManagement')}
            />
          )}

          {/* Membership Section */}
          {isSidebarItemVisible(user?.role, 'membership') && (
            <MenuSection
              title="Membership"
              items={membershipItems}
              expanded={expandedMenus.membership}
              onToggle={() => toggleMenu('membership')}
            />
          )}

          {/* Content Section */}
          {isSidebarItemVisible(user?.role, 'content') && (
            <MenuSection
              title="Content"
              items={contentItems}
              expanded={expandedMenus.content}
              onToggle={() => toggleMenu('content')}
            />
          )}

          {/* Settings Section */}
          {isSidebarItemVisible(user?.role, 'settings') && (
            <MenuSection
              title="Settings"
              items={settingsItems}
              expanded={expandedMenus.settings}
              onToggle={() => toggleMenu('settings')}
            />
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden animate-fade-in"
        />
      )}
    </>
  );
};

export default Sidebar;

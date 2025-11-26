import React, { useState } from 'react';
import { ChevronDown, X, Home, Users, Building2, Settings, BarChart3, FileText, Briefcase } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, onNavigate, currentPage }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    dashboard: true,
    applications: false,
    superAdmin: false,
    crm: true,
    reports: false,
    crmSettings: false,
    userManagement: false,
    settings: false,
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

  const applicationsItems = (
    <>
      <SubmenuItem icon={Home} label="Chat" />
      <SubmenuItem icon={Home} label="Video Call" />
      <SubmenuItem icon={Home} label="Audio Call" />
      <SubmenuItem icon={Home} label="Call History" />
      <SubmenuItem icon={Home} label="Calendar" />
      <SubmenuItem icon={Home} label="Email" />
      <SubmenuItem icon={Home} label="To Do" />
      <SubmenuItem icon={Home} label="Notes" />
      <SubmenuItem icon={Home} label="File Manager" />
    </>
  );

  const crmMenuItems = (
    <>
      <SubmenuItem icon={Users} label="Contacts" page="contacts" />
      <SubmenuItem icon={Building2} label="Companies" page="companies" />
      <SubmenuItem icon={FileText} label="Deals" page="deals-list" />
      <SubmenuItem icon={Users} label="Leads" page="leads" />
      <SubmenuItem icon={Briefcase} label="Pipeline" page="pipeline" />
    </>
  );

  const reportsItems = (
    <>
      <SubmenuItem icon={BarChart3} label="Lead Reports" />
      <SubmenuItem icon={BarChart3} label="Deal Reports" />
      <SubmenuItem icon={BarChart3} label="Contact Reports" />
      <SubmenuItem icon={BarChart3} label="Company Reports" />
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
          <MenuSection
            title="Applications"
            items={applicationsItems}
            expanded={expandedMenus.applications}
            onToggle={() => toggleMenu('applications')}
          />

          {/* Super Admin */}
          <MenuSection
            title="Super Admin"
            items={
              <>
                <SubmenuItem icon={Home} label="Dashboard" />
                <SubmenuItem icon={Building2} label="Companies" />
                <SubmenuItem icon={FileText} label="Subscriptions" />
              </>
            }
            expanded={expandedMenus.superAdmin}
            onToggle={() => toggleMenu('superAdmin')}
          />

          {/* CRM Section */}
          <div className="pt-4">
            <h3 className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">CRM</h3>
            <div className="space-y-1">
              {crmMenuItems}
            </div>
          </div>

          {/* Reports Section */}
          <div className="pt-4">
            <h3 className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Reports</h3>
            <div className="space-y-1">
              {reportsItems}
            </div>
          </div>

          {/* Settings Section */}
          <MenuSection
            title="Settings"
            items={settingsItems}
            expanded={expandedMenus.settings}
            onToggle={() => toggleMenu('settings')}
          />
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

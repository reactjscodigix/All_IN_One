import React, { useState } from 'react';
import { 
  ChevronDown, X, Home, Users, Building2, Settings, BarChart3, FileText, 
  Briefcase, MessageCircle, Shield, Trash2, Users2, FileJson, MapPin, 
  MessageSquare, HelpCircle, Lock, Layout, TrendingUp, Search,
  Database, Code, Terminal, Palette, Megaphone, Receipt, Wallet, 
  PieChart, Activity, CheckCircle, AlertCircle, Calendar, FileCheck, Layers,
  ClipboardList, Target, Percent, Bell, UserCircle, FileStack, 
  Workflow, Zap, ShieldCheck, BarChart, HardDrive, Cpu, Bug, GitBranch,
  Rocket, Gauge, AlertTriangle, FileBarChart, CreditCard, Banknote,
  Scale, History, Eye, SearchCode
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isSidebarItemVisible, isModuleAccessible, getMenuItemAccess } from '../utils/roleBasedAccess';
import { showInfoToast } from '../utils/toast';

const Sidebar = ({ isOpen, toggleSidebar, onNavigate, currentPage }) => {
  const { user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({
    admin: true,
    leads: true,
    deals: true,
    sales: true,
    marketing: true,
    it: true,
    accounting: true,
    crm: true,
    operations: true,
    reports: true,
    activities: false,
    settings: false,
    userManagement: false,
    salesCRM: true,
    salesOverview: false,
    salesActivities: false,
    salesFinance: false,
    marketingProjects: true,
    marketingManagement: false,
    itProjects: true,
    itManagement: false,
    accountingFinance: true,
    accountingManager: false,
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const SubmenuItem = ({ icon: Icon, label, onClick, active, page, moduleKey, prefix: propPrefix }) => {
    const isAccessible = !moduleKey || isModuleAccessible(user?.role, moduleKey);
    const accessLevel = page ? getMenuItemAccess(user?.role, `${page.charAt(0).toUpperCase()}${page.slice(1)}`) : null;
    const isViewOnly = accessLevel === 'view_only' || accessLevel === 'view_only_if_assigned';
    
    if (!isAccessible) {
      return null;
    }
    
    const handleClick = () => {
      showInfoToast(`Navigating to ${label}...`);
      
      let finalPage = page;
      
      // Helper to determine department prefix based on current context
      const getDepartmentPrefix = () => {
        // Fallback to user's primary department
        if (user?.role === 'Super Admin') return '/super-admin';
        if (user?.role === 'Admin' || user?.department === 'Leads Management' || user?.department === 'Deals Management' || user?.role === 'Sales Manager' || user?.role === 'Sales Executive' || user?.department === 'Sales Department') return '/sales';
        if (user?.department === 'Marketing Department') return '/marketing';
        if (user?.department === 'IT Department') return '/it';
        
        return '';
      };

      const prefix = propPrefix || getDepartmentPrefix();
      
      // Apply department prefix to known shared modules
      const sharedModules = [
        'calendar', 'tasks', 'followups', 'analytics', 'reports', 
        'dashboard', 'list', 'details', 'kanban', 'quotations', 
        'customers', 'targets', 'performance', 'commission', 'distribution',
        'contacts', 'companies', 'campaign', 'proposals', 'contracts', 
        'estimations', 'invoices', 'payments', 'activities', 'chat',
        'video-call', 'audio-call', 'call-history', 'email', 'todo', 
        'notes', 'file-manager', 'social-feed', 'seo-gmb', 'ppc-ads',
        'graphics-video', 'content-calendar', 'blogs-calendar', 'marketing-drive',
        'it-inventory', 'it-ticketing'
      ];
      
      if (sharedModules.some(m => page.includes(m))) {
        let cleanPage = page;
        if (page === 'deals-dashboard' || page === 'leads-dashboard' || page === 'sales-dashboard' || page === 'projects-dashboard') {
          cleanPage = 'dashboard';
        } else if (page === 'deals-list' || page === 'leads') {
          cleanPage = 'list';
        } else if (page === 'project-details') {
          cleanPage = 'details';
        } else if (page === 'deals-kanban') {
          cleanPage = 'kanban';
        } else if (page === 'sales-targets') {
          cleanPage = 'targets';
        } else if (page === 'sales-reports') {
          cleanPage = 'reports';
        } else if (page === 'it-chat') {
          cleanPage = 'chat';
        } else if (page === 'revenue-forecast') {
          cleanPage = 'analytics';
        }
        
        finalPage = `${prefix}/${cleanPage}`;
      } else if (page === 'deals-dashboard') {
        finalPage = '/deals/dashboard';
      } else if (page === 'leads-dashboard') {
        finalPage = '/leads/dashboard';
      } else if (page === 'sales-dashboard') {
        finalPage = '/sales/dashboard';
      } else if (page === 'projects-dashboard') {
        finalPage = '/projects/dashboard';
      }
      
      // Ensure no double slashes and handles roots
      if (finalPage.startsWith('//')) finalPage = finalPage.substring(1);
      
      onNavigate(finalPage);
      if (toggleSidebar) toggleSidebar();
    };
    
    return (
      <button
        onClick={handleClick}
        title={isViewOnly ? 'View-only access' : ''}
        className={`menu-item w-full flex items-center gap-3 p-2 text-xs rounded transition-all duration-200 ${
          currentPage === page
            ? 'bg-red-600 text-white   shadow-sm border border-red-100'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {Icon ? <Icon size={14} className={currentPage === page ? 'text-red ' : ''} /> : <span className={`w-1 h-1 rounded-full bg-current transition-transform ${currentPage === page ? 'scale-125' : ''}`}></span>}
        <span className="flex-1 text-left">{label}</span>
        {isViewOnly && <Lock size={14} className="opacity-60" title="View-only" />}
      </button>
    );
  };

  const MenuSection = ({ title, items, expanded, onToggle }) => (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className="menu-item w-full flex items-center justify-between p-2  text-xs text-gray-500  hover:bg-gray-50 hover:text-gray-700 rounded transition-smooth"
      >
        <span>{title}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && <div className="space-y-1 animate-fade-in">{items}</div>}
    </div>
  );

  const NestedMenu = ({ icon: Icon, label, items, expanded, onToggle, active }) => (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={`menu-item w-full flex items-center gap-3 px-3 py-2 text-xs  rounded transition-all duration-200 ${
          active
            ? 'bg-red-50 text-black '
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {Icon && <Icon size={18} className={active ? 'text-red ' : ''} />}
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''} text-black`} />
      </button>
      {expanded && <div className="animate-fade-in pl-4 space-y-0.5">{items}</div>}
    </div>
  );

  const isManager = user?.role?.toLowerCase().includes('manager') || user?.role === 'Admin' || user?.role === 'Super Admin';
  const isSalesRole = user?.role === 'Sales Manager' || user?.role === 'Sales Executive' || user?.department === 'Sales Department' || user?.department === 'Leads Management' || user?.department === 'Deals Management';
  const isSuperAdmin = user?.role === 'Super Admin';

  const renderAdminMenu = () => (
    <NestedMenu
      icon={ShieldCheck}
      label="Admin Dashboard"
      expanded={expandedMenus.admin}
      onToggle={() => toggleMenu('admin')}
      active={['deals-dashboard', 'manage-users', 'roles-permissions', 'pipeline', 'quotations', 'projects', 'sales-targets', 'approvals', 'analytics', 'profile-settings', 'notifications'].includes(currentPage)}
      items={
        <>
          <SubmenuItem label="Dashboard Overview" page="deals-dashboard" icon={Layout} prefix="/super-admin" />
          <SubmenuItem label="Users & Roles" page="manage-users" icon={Users} prefix="/super-admin" />
          <SubmenuItem label="Departments" page="departments" icon={Building2} prefix="/super-admin" />
          <SubmenuItem label="Lead Settings" page="leads" icon={Settings} prefix="/super-admin" />
          <SubmenuItem label="Pipeline Settings" page="pipeline" icon={Layers} prefix="/super-admin" />
          <SubmenuItem label="Quotation Settings" page="quotations" icon={FileStack} prefix="/super-admin" />
          <SubmenuItem label="Project Templates" page="projects" icon={Briefcase} prefix="/super-admin" />
          <SubmenuItem label="Targets & KPI" page="sales-targets" icon={Target} prefix="/super-admin" />
          <SubmenuItem label="Automation Rules" page="automation-rules" icon={Zap} prefix="/super-admin" />
          <SubmenuItem label="Approvals Control" page="approvals" icon={ShieldCheck} prefix="/super-admin" />
          <SubmenuItem label="All Projects" page="projects" icon={Briefcase} prefix="/super-admin" />
          <SubmenuItem label="All Tasks" page="tasks" icon={ClipboardList} prefix="/super-admin" />
          <SubmenuItem label="Invoices & Payments" page="invoices" icon={CreditCard} prefix="/super-admin" />
          <SubmenuItem label="Reports & Analytics" page="analytics" icon={BarChart} prefix="/super-admin" />
          <SubmenuItem label="System Settings" page="profile-settings" icon={Settings} prefix="/super-admin" />
          <SubmenuItem label="Notifications" page="notifications" icon={Bell} prefix="/super-admin" />
          <SubmenuItem label="Profile" page="profile-settings" icon={UserCircle} prefix="/super-admin" />
        </>
      }
    />
  );

  const renderOperationsMenu = () => (
    <NestedMenu
      icon={Layout}
      label="CRM Operations"
      expanded={expandedMenus.operations}
      onToggle={() => toggleMenu('operations')}
      active={['leads-dashboard', 'leads', 'deals-dashboard', 'deals-list', 'pipeline', 'projects-dashboard', 'projects', 'kanban', 'quotations', 'contacts', 'companies', 'invoices', 'analytics', 'reports', 'notifications', 'profile-settings', 'followups', 'approvals', 'tasks', 'performance', 'commission', 'calendar', 'campaign'].includes(currentPage)}
      items={
        <>
          <SubmenuItem label="Leads Dashboard" page="leads-dashboard" icon={Layout} prefix="/leads" />
          <SubmenuItem label="Sales Dashboard" page="sales-dashboard" icon={Layout} prefix="/sales" />
          <SubmenuItem label="Deals Dashboard" page="deals-dashboard" icon={BarChart3} prefix="/deals" />
          <SubmenuItem label="All Leads" page="leads" icon={Users} prefix="/leads" />
          <SubmenuItem label="All Deals" page="deals-list" icon={Briefcase} prefix="/deals" />
          
          <div className="p-2 text-xs  text-[#1F2020] uppercase tracking-wider bg-gray-50/50 mt-2">Operations</div>
          <SubmenuItem label="All Projects" page="projects" icon={Layers} prefix="/projects" />
          <SubmenuItem label="Quotations" page="quotations" icon={FileStack} prefix="/deals" />
          <SubmenuItem label="Clients" page="contacts" icon={Users2} prefix="/deals" />
          <SubmenuItem label="Invoices" page="invoices" icon={CreditCard} prefix="/deals" />
          <SubmenuItem label="Campaigns" page="campaign" icon={Megaphone} prefix="/deals" />
          <SubmenuItem label="Reports & Analytics" page="analytics" icon={BarChart} prefix="/deals" />
          
          {/* Support Modules */}
          <div className="p-2 text-xs    text-[#1F2020] ">Support</div>
          <SubmenuItem label="My Tasks" page="tasks" icon={ClipboardList} prefix="/deals" />
          <SubmenuItem label="Follow-Ups" page="followups" icon={History} prefix="/deals" />
          <SubmenuItem label="Calendar" page="calendar" icon={Calendar} prefix="/deals" />
          <SubmenuItem label="Notifications" page="notifications" icon={Bell} />
          <SubmenuItem label="Profile" page="profile-settings" icon={UserCircle} />
        </>
      }
    />
  );

  const renderAccountingMenu = () => (
    <NestedMenu
      icon={Banknote}
      label="Accounting Dashboard"
      expanded={expandedMenus.accounting}
      onToggle={() => toggleMenu('accounting')}
      active={['deals', 'invoices', 'payments', 'commission', 'analytics', 'approvals', 'activities', 'notifications', 'profile-settings'].includes(currentPage)}
      items={
        <>
          <SubmenuItem label="Dashboard" page="deals" icon={Layout} />
          <SubmenuItem label="Invoices" page="invoices" icon={FileText} />
          <SubmenuItem label="Payments" page="payments" icon={CreditCard} />
          <SubmenuItem label="Pending Dues" page="invoices" icon={AlertCircle} />
          <SubmenuItem label="Expense Entries" page="payments" icon={Banknote} />
          <SubmenuItem label="Commission Processing" page="commission" icon={Wallet} />
          <SubmenuItem label="Tax Reports" page="analytics" icon={Scale} />
          {isManager && (
            <>
              <SubmenuItem label="All Invoices" page="invoices" icon={FileStack} />
              <SubmenuItem label="Payment Tracking" page="payments" icon={History} />
              <SubmenuItem label="Overdue Management" page="invoices" icon={AlertTriangle} />
              <SubmenuItem label="Expense Approval" page="approvals" icon={FileCheck} />
              <SubmenuItem label="Commission Approval" page="approvals" icon={CheckCircle} />
              <SubmenuItem label="Financial Forecast" page="analytics" icon={TrendingUp} />
              <SubmenuItem label="Profit & Loss" icon={PieChart} page="analytics" />
              <SubmenuItem label="Audit Logs" page="activities" icon={History} />
              <SubmenuItem label="Financial Reports" page="analytics" icon={BarChart} />
            </>
          )}
          <SubmenuItem label="Notifications" page="notifications" icon={Bell} />
          <SubmenuItem label="Profile" page="profile-settings" icon={UserCircle} />
        </>
      }
    />
  );

  const renderSalesMenu = () => (
    <NestedMenu
      icon={TrendingUp}
      label="Sales Management"
      expanded={expandedMenus.sales}
      onToggle={() => toggleMenu('sales')}
      active={['sales-dashboard', 'leads-dashboard', 'leads', 'leads-distribution', 'deals-dashboard', 'deals-list', 'revenue-forecast', 'approvals', 'tasks', 'followups', 'calendar', 'quotations', 'contacts', 'invoices', 'campaign', 'analytics'].includes(currentPage)}
      items={
        <>
          <SubmenuItem label="Leads Dashboard" page="leads-dashboard" icon={Layout} prefix="/leads" />
          <SubmenuItem label="Sales Dashboard" page="sales-dashboard" icon={Layout} prefix="/sales" />
          <SubmenuItem label="Deals Dashboard" page="deals-dashboard" icon={BarChart3} prefix="/deals" />
          <SubmenuItem label="All Leads" page="leads" icon={Users} prefix="/leads" />
          <SubmenuItem label="All Deals" page="deals-list" icon={Briefcase} prefix="/deals" />

          {isManager && <div className="p-1.5 text-xs  text-gray-400 uppercase mt-1">Management</div>}
          {isManager && <SubmenuItem label="Lead Distribution" page="leads-distribution" icon={Users2} prefix="/leads" />}

          <div className="p-1.5 text-xs  text-gray-400 uppercase mt-1">Operations</div>
          <SubmenuItem label="My Tasks" page="tasks" icon={ClipboardList} prefix="/sales" />
          <SubmenuItem label="Follow-Ups" page="followups" icon={History} prefix="/sales" />
          <SubmenuItem label="Calendar" page="calendar" icon={Calendar} prefix="/sales" />
          <SubmenuItem label="Quotations" page="quotations" icon={FileStack} prefix="/deals" />
          <SubmenuItem label="Clients" page="contacts" icon={Users2} prefix="/deals" />
          <SubmenuItem label="Invoices" page="invoices" icon={CreditCard} prefix="/deals" />
          <SubmenuItem label="Campaigns" page="campaign" icon={Megaphone} prefix="/deals" />
          <SubmenuItem label="Reports & Analytics" page="analytics" icon={BarChart} prefix="/deals" />

          <div className="p-1.5 text-xs  text-gray-400 uppercase mt-1">Support</div>
          <SubmenuItem label="Notifications" page="notifications" icon={Bell} />
          <SubmenuItem label="Profile" page="profile-settings" icon={UserCircle} />
        </>
      }
    />
  );

  const renderITMenu = () => (
    <NestedMenu
      icon={Terminal}
      label="IT Project Dashboard"
      expanded={expandedMenus.it}
      onToggle={() => toggleMenu('it')}
      active={['projects-dashboard', 'projects', 'tasks', 'kanban', 'analytics', 'file-manager', 'notes', 'calendar', 'chat', 'activities'].includes(currentPage)}
      items={
        <>
          {/* Project Focus - Jira Style */}
          <div className="p-2 text-xs    text-[#1F2020] ">Project Management</div>
          <SubmenuItem label="IT Dashboard" page="projects-dashboard" icon={Layout} prefix="/it" />
          {isManager && <SubmenuItem label="Manager Overview" page="it-manager-dashboard" icon={Gauge} prefix="/it" />}
          {isManager && <SubmenuItem label="Team Management" page="it-teams" icon={Users2} prefix="/it" />}
          <SubmenuItem label="All Projects" page="projects" icon={Briefcase} prefix="/it" />
          <SubmenuItem label="Tasks & Issues" page="tasks" icon={ClipboardList} prefix="/it" />
          <SubmenuItem label="Kanban Board" page="kanban" icon={Layers} prefix="/it" />
          
          {/* Engineering/Development Tools */}
          <div className="p-2 text-xs    text-[#1F2020] ">Development Tools</div>
          <SubmenuItem label="Analytics & KPI" page="analytics" icon={BarChart} prefix="/it" />
          <SubmenuItem label="Activity Stream" page="activities" icon={Activity} prefix="/it" />
          <SubmenuItem label="Files & Docs" page="file-manager" icon={HardDrive} prefix="/it" />
          
          {/* Communication */}
          <div className="p-2 text-xs    text-[#1F2020] ">Collaboration</div>
          <SubmenuItem label="IT Calendar" page="calendar" icon={Calendar} prefix="/it" />
          <SubmenuItem label="Team Chat" page="it-chat" icon={Users} prefix="/it" />
          <SubmenuItem label="Notes & Wiki" page="notes" icon={FileText} prefix="/it" />
          
          {/* Support/Personal */}
          <div className="p-2 text-xs    text-[#1F2020] ">Support</div>
          <SubmenuItem label="Notifications" page="notifications" icon={Bell} />
          <SubmenuItem label="My Profile" page="profile-settings" icon={UserCircle} />
        </>
      }
    />
  );

  const renderMarketingMenu = () => (
    <NestedMenu
      icon={Megaphone}
      label="Marketing Dashboard"
      expanded={expandedMenus.marketing}
      onToggle={() => toggleMenu('marketing')}
      active={['projects-dashboard', 'projects', 'tasks', 'campaign', 'calendar', 'all-blogs', 'file-manager', 'analytics', 'activities'].includes(currentPage)}
      items={
        <>
          {/* Digital Marketing Operations */}
          <div className="p-2 text-xs    text-[#1F2020] ">Marketing Operations</div>
          <SubmenuItem label="Marketing Overview" page="projects-dashboard" icon={Layout} prefix="/marketing" />
          <SubmenuItem label="All Projects" page="projects" icon={Briefcase} prefix="/marketing" />
          <SubmenuItem label="Daily Tasks" page="tasks" icon={ClipboardList} prefix="/marketing" />
          
          {/* Specialized Teams/Tasks */}
          <div className="p-2 text-xs    text-[#1F2020] ">Specialized Channels</div>
          <SubmenuItem label="SEO & GMB" page="seo-gmb" icon={SearchCode} prefix="/marketing" />
          <SubmenuItem label="PPC (Paid Ads)" page="campaign" icon={TrendingUp} prefix="/marketing" />
          <SubmenuItem label="Graphics & Video" page="tasks" icon={Palette} prefix="/marketing" />
          
          {/* Content & Scheduling */}
          <div className="p-2 text-xs    text-[#1F2020] ">Content Strategy</div>
          <SubmenuItem label="Content Calendar" page="calendar" icon={Calendar} prefix="/marketing" />
          <SubmenuItem label="Blogs Calendar" page="all-blogs" icon={FileJson} prefix="/marketing" />
          
          {/* Assets & Data */}
          <div className="p-2 text-xs    text-[#1F2020] ">Assets & Analytics</div>
          <SubmenuItem label="Marketing Drive" page="file-manager" icon={HardDrive} prefix="/marketing" />
          <SubmenuItem label="Campaign Analytics" page="analytics" icon={BarChart} prefix="/marketing" />
          <SubmenuItem label="Activity Stream" page="activities" icon={Activity} prefix="/marketing" />
          
          {/* Support */}
          <div className="p-2 text-xs    text-[#1F2020] ">Support</div>
          <SubmenuItem label="Notifications" page="notifications" icon={Bell} />
          <SubmenuItem label="My Profile" page="profile-settings" icon={UserCircle} />
        </>
      }
    />
  );

  const mainMenuItems = (
    <>
      {/* Super Admin sees everything */}
      {isSuperAdmin && (
        <>
          {renderAdminMenu()}
          {renderOperationsMenu()}
          {renderMarketingMenu()}
          {renderITMenu()}
          {renderAccountingMenu()}
        </>
      )}

      {/* Sales Role (Non-Super Admin) sees ONLY Sales Menu */}
      {isSalesRole && !isSuperAdmin && renderSalesMenu()}

      {/* Other Roles see their respective menus */}
      {!isSuperAdmin && !isSalesRole && (
        <>
          {(user?.department === 'Admin' || !user?.department) && renderAdminMenu()}
          {user?.department === 'Sales Department' && renderSalesMenu()}
          {user?.department === 'Marketing Department' && renderMarketingMenu()}
          {user?.department === 'IT Department' && renderITMenu()}
          {user?.department === 'Accounting Department' && renderAccountingMenu()}
        </>
      )}
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
      <SubmenuItem icon={MessageCircle} label="Chat" page="chat" moduleKey="Activities" />
      <MenuSection
        title="Call"
        items={callItems}
        expanded={expandedMenus.call}
        onToggle={() => toggleMenu('call')}
      />
      <SubmenuItem icon={Home} label="Calendar" page="calendar" moduleKey="Activities" />
      <SubmenuItem icon={Home} label="Email" page="email" moduleKey="Activities" />
      <SubmenuItem icon={Home} label="To Do" page="todo" moduleKey="Tasks" />
      <SubmenuItem icon={Home} label="Notes" page="notes" moduleKey="Activities" />
      <SubmenuItem icon={Home} label="File Manager" page="file-manager" moduleKey="Activities" />
      <SubmenuItem icon={Home} label="Social Feed" page="social-feed" moduleKey="Activities" />
      <SubmenuItem icon={Home} label="Kanban" page="kanban" moduleKey="Pipelines" />
      <SubmenuItem icon={Home} label="Invoices" page="invoices" moduleKey="Invoices" />
    </>
  );

  const crmMenuItems = (
    <>
      <SubmenuItem icon={Users} label="Contacts" page="contacts" moduleKey="Contacts" />
      <SubmenuItem icon={Building2} label="Companies" page="companies" moduleKey="Companies" />
      <SubmenuItem icon={FileText} label="Campaign" page="campaign" moduleKey="Campaign" />
      <SubmenuItem icon={FileText} label="Proposals" page="proposals" moduleKey="Proposals" />
      <SubmenuItem icon={FileText} label="Contracts" page="contracts" moduleKey="Contracts" />
      <SubmenuItem icon={FileText} label="Estimations" page="estimations" moduleKey="Estimations" />
      <SubmenuItem icon={FileText} label="Invoices" page="invoices" moduleKey="Invoices" />
      <SubmenuItem icon={FileText} label="Payments" page="payments" moduleKey="Payments" />
      <SubmenuItem icon={BarChart3} label="Analytics" page="analytics" moduleKey="Analytics" />
      <SubmenuItem icon={FileText} label="Activities" page="activities" moduleKey="Activities" />
    </>
  );

  const reportsItems = (
    <>
      <SubmenuItem icon={BarChart3} label="Contact Reports" page="contact-report" moduleKey="Contacts" />
      <SubmenuItem icon={BarChart3} label="Company Reports" page="company-report" moduleKey="Companies" />
    </>
  );

  const userManagementItems = (
    <>
      <SubmenuItem icon={Users} label="Manage Users" page="manage-users" moduleKey="UserManagement" />
      <SubmenuItem icon={Shield} label="Roles & Permissions" page="roles-permissions" moduleKey="Roles" />
      <SubmenuItem icon={Trash2} label="Delete Request" page="delete-request" moduleKey="UserManagement" />
    </>
  );

  const membershipItems = (
    <>
      <SubmenuItem icon={Users2} label="Membership Plans" page="membership-plans" moduleKey="UserManagement" />
      <SubmenuItem icon={Users2} label="Membership Addons" page="membership-addons" moduleKey="UserManagement" />
      <SubmenuItem icon={Users2} label="Membership Transactions" page="membership-transactions" moduleKey="UserManagement" />
    </>
  );

  const blogItems = (
    <>
      <SubmenuItem icon={FileJson} label="All Blogs" page="all-blogs" moduleKey="Content" />
      <SubmenuItem icon={FileJson} label="Blog Categories" page="blog-categories" moduleKey="Content" />
      <SubmenuItem icon={FileJson} label="Blog Comments" page="blog-comments" moduleKey="Content" />
      <SubmenuItem icon={FileJson} label="Blog Tags" page="blog-tags" moduleKey="Content" />
    </>
  );

  const locationItems = (
    <>
      <SubmenuItem icon={MapPin} label="Location" page="location" moduleKey="Content" />
    </>
  );

  const contentItems = (
    <>
      <SubmenuItem icon={FileText} label="Pages" page="pages" moduleKey="Content" />
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
      <SubmenuItem icon={MessageSquare} label="Testimonials" page="testimonials" moduleKey="Content" />
      <SubmenuItem icon={HelpCircle} label="FAQ" page="faq" moduleKey="Content" />
    </>
  );

  const settingsItems = (
    <>
      <SubmenuItem icon={Settings} label="General Settings" moduleKey="Roles" />
      <SubmenuItem icon={Settings} label="Website Settings" moduleKey="Roles" />
      <SubmenuItem icon={Settings} label="System Settings" moduleKey="Roles" />
      <SubmenuItem icon={Settings} label="Financial Settings" moduleKey="Roles" />
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
        <div className="p-2 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded  bg-red-600 flex items-center justify-center text-white   shadow-sm">
              D
            </div>
            <span className="text-base   text-gray-900 tracking-tight">Enterprise CRM</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 text-[#1F2020] hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Search */}
        

        {/* Menu Content */}
        <div className="p-2 space-y-4">
          {/* Main Menu Items */}
          <div className="space-y-1">
            {mainMenuItems}
          </div>

          {/* Global Tools - Optional, can be restricted if needed */}
          {!['Admin', 'Leads Management', 'Deals Management', 'Sales Department', 'Marketing Department', 'IT Department', 'Accounting Department'].includes(user?.department) && (
            <>
              {isSidebarItemVisible(user?.role, 'applications') && (
                <MenuSection
                  title="Applications"
                  items={applicationsItems}
                  expanded={expandedMenus.applications}
                  onToggle={() => toggleMenu('applications')}
                />
              )}

              {isSidebarItemVisible(user?.role, 'crm') && (
                <MenuSection
                  title="CRM"
                  items={crmMenuItems}
                  expanded={expandedMenus.crm}
                  onToggle={() => toggleMenu('crm')}
                />
              )}
            </>
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

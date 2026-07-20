import React, { useState } from 'react';
import { Menu, Search, Bell, Settings, Moon, Grid, Maximize2, HelpCircle, PieChart, MessageSquare, LogOut, User, Bell as BellIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notificationsData, setNotificationsData] = useState([
    {
      id: 1,
      avatar: 'JD',
      avatarColor: 'bg-blue-500',
      name: 'John Doe',
      message: 'left 6 comments on Isla Nublar',
      time: '08:00 AM',
      read: false
    },
    {
      id: 2,
      avatar: 'TW',
      avatarColor: 'bg-purple-500',
      name: 'Thomas William',
      message: 'finished de-bugging the phones',
      time: '08:15 AM',
      read: false
    },
    {
      id: 3,
      avatar: 'SA',
      avatarColor: 'bg-green-500',
      name: 'Sarah Anderson',
      message: 'attached a file to SOC2 compliance report',
      time: '08:30 AM',
      read: true
    },
  ]);

  const [messagesData, setMessagesData] = useState([
    {
      id: 1,
      avatar: 'JD',
      avatarColor: 'bg-blue-500',
      name: 'John Doe',
      message: "Sure, Sarah. What's the new policy?",
      time: '08:00 AM',
      read: false
    },
  ]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleDarkModeToggle = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotificationsData(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleOpenMessages = () => {
    setShowMessages(!showMessages);
    if (!showMessages) {
      setMessagesData(prev => prev.map(m => ({ ...m, read: true })));
    }
  };

  const dept = user?.department?.toLowerCase() || 'it';
  const designation = user?.role ? user.role.toLowerCase().replace(/\s+/g, '-') : 'employee';
  const username = user?.name ? user.name.toLowerCase().replace(/\s+/g, '-') : 'user';
  const basePath = `/${dept}/${designation}/${username}`;

  const quickAccessMenu = [
    { label: 'Contacts', desc: 'View All the Contacts', path: `${basePath}/contacts` },
    { label: 'Pipeline', desc: 'View All the Pipeline', path: `/${dept}/${designation}/${username}/kanban` },
    { label: 'Activities', desc: 'Activities', path: `${basePath}/activities` },
    { label: 'Analytics', desc: 'Analytics', path: `/analytics` },
  ];

  return (
    <header className="bg-white border-b border-border-light sticky top-0 z-20  transition-smooth">
      <div className="px-2 sm:px-6 lg:px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Menu Toggle & Search */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={toggleSidebar}
              className="icon-btn lg:hidden p-2 hover:bg-gray-100 rounded  text-gray-600"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:block flex-1 max-w-xs">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F2020]" />
                <input
                  type="text"
                  placeholder="Search Keyword"
                  className="w-full pl-10 pr-4 py-2 border border-border-light rounded  text-xs  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-smooth"
                />
              </div>
            </div>
          </div>

          {/* Right: Icons & Profile */}
          <div className="flex items-center gap-1">
            {/* Header Icons */}
            <button
              onClick={toggleFullscreen}
              className="icon-btn p-2 hover:bg-gray-100 rounded text-gray-600 animate-fade-in"
              title="Fullscreen"
            >
              <Maximize2 size={20} />
            </button>

            <button
              onClick={handleDarkModeToggle}
              className="icon-btn p-2 hover:bg-gray-100 rounded text-gray-600 transition-transform active:scale-95"
              title="Dark Mode"
            >
              <Moon size={20} className={`${darkMode ? 'text-blue-500 fill-blue-500' : ''}`} />
            </button>

            {/* Quick Access Menu */}
            <div className="relative">
              <button
                onClick={() => setShowQuickAccess(!showQuickAccess)}
                className="icon-btn p-2 hover:bg-teal-100 rounded text-teal-600 active:scale-95 transition-all"
                title="Quick Access"
              >
                <Grid size={20} />
              </button>

              {showQuickAccess && (
                <div className="dropdown-menu absolute right-0 mt-2 w-56 bg-white z-50 rounded shadow-xl border border-gray-100 py-1">
                  <div className="p-2 space-y-1">
                    {quickAccessMenu.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setShowQuickAccess(false);
                        }}
                        className="menu-item p-3 hover:bg-teal-50 rounded-md cursor-pointer group transition-all duration-200"
                      >
                        <p className="text-gray-900 text-xs font-semibold group-hover:text-teal-600 transition-colors">{item.label}</p>
                        <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <div className="relative">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="icon-btn p-2 hover:bg-purple-100 rounded text-purple-600 active:scale-95 transition-all"
                title="Help"
              >
                <HelpCircle size={20} />
              </button>
              {showHelp && (
                <div className="dropdown-menu absolute right-0 mt-2 w-64 bg-white z-50 p-4 rounded shadow-xl border border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-900 mb-1">Help & Support</h4>
                  <p className="text-xs text-gray-500 mb-2">Need assistance with your CRM dashboard? Our support team is here to help.</p>
                  <a href="mailto:support@codigix.com" className="text-xs text-blue-600 hover:underline">Email: support@codigix.com</a>
                </div>
              )}
            </div>

            {/* Analytics */}
            <button
              onClick={() => navigate('/analytics')}
              className="icon-btn p-2 hover:bg-yellow-100 rounded text-yellow-600 active:scale-95 transition-all"
              title="Analytics"
            >
              <PieChart size={20} />
            </button>

            {/* Messages */}
            <div className="relative">
              <button
                onClick={handleOpenMessages}
                className="icon-btn relative p-2 hover:bg-gray-100 rounded text-gray-600 active:scale-95 transition-all"
                title="Messages"
              >
                <MessageSquare size={20} />
                {messagesData.some(m => !m.read) && (
                  <span className="notification-badge absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              {showMessages && (
                <div className="dropdown-menu absolute right-0 mt-2 w-80 bg-white z-50 rounded shadow-xl border border-gray-100 py-1">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-900">Messages</h3>
                    {messagesData.some(m => !m.read) && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ">New</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {messagesData.map((msg, idx) => (
                      <div
                        key={msg.id}
                        onClick={() => {
                          navigate(`/${dept}/${designation}/${username}/chat`);
                          setShowMessages(false);
                        }}
                        className="notification-item p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex gap-3">
                          <div className={`w-9 h-9 rounded-full ${msg.avatarColor} flex items-center justify-center text-white text-xs  shrink-0 `}>
                            {msg.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900">{msg.name}</p>
                            <p className="text-xs text-gray-600 truncate mt-0.5">{msg.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 border-t border-gray-100 text-center bg-gray-50 rounded-b-lg">
                    <button
                      onClick={() => {
                        navigate(`/${dept}/${designation}/${username}/chat`);
                        setShowMessages(false);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      Open Chat Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleOpenNotifications}
                className="icon-btn relative p-2 hover:bg-gray-100 rounded text-gray-600 active:scale-95 transition-all"
                title="Notifications"
              >
                <Bell size={20} />
                {notificationsData.some(n => !n.read) && (
                  <span className="notification-badge absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="dropdown-menu absolute right-0 mt-2 w-80 bg-white z-50 rounded shadow-xl border border-gray-100 py-1">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Settings size={15} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationsData.map((notif, idx) => (
                      <div
                        key={notif.id}
                        className="notification-item p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex gap-3">
                          <div className={`w-9 h-9 rounded-full ${notif.avatarColor} flex items-center justify-center text-white text-xs  shrink-0 `}>
                            {notif.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900">{notif.name}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 border-t border-gray-100 text-center bg-gray-50 rounded-b-lg">
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center p-1 hover:bg-gray-100 rounded transition-smooth active:scale-95"
                title="Profile"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-white text-xs  border-2 border-green-400 hover-lift">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {showProfile && (
                <div className="dropdown-menu absolute right-0 mt-2 w-56 bg-white z-50 rounded shadow-xl border border-gray-100 py-1">
                  <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-white text-xs  shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs  text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-600 truncate">{user?.role || 'Member'}{user?.department ? ` • ${user.department}` : ''}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <button
                      onClick={() => {
                        navigate('/profile-settings');
                        setShowProfile(false);
                      }}
                      className="menu-item w-full text-left p-2 text-xs text-gray-700 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-2"
                    >
                      <User size={15} />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowProfile(false);
                      }}
                      className="menu-item w-full text-left p-2 text-xs text-gray-700 hover:bg-purple-50 rounded-md transition-colors flex items-center gap-2"
                    >
                      <BellIcon size={15} />
                      Notifications
                    </button>
                    <button
                      onClick={() => {
                        setShowHelp(true);
                        setShowProfile(false);
                      }}
                      className="menu-item w-full text-left p-2 text-xs text-gray-700 hover:bg-green-50 rounded-md transition-colors flex items-center gap-2"
                    >
                      <HelpCircle size={15} />
                      Help & Support
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile-settings');
                        setShowProfile(false);
                      }}
                      className="menu-item w-full text-left p-2 text-xs text-gray-700 hover:bg-orange-50 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Settings size={15} />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="menu-item w-full text-left p-2 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

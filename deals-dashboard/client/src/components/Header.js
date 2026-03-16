import React, { useState } from 'react';
import { Menu, Search, Bell, Settings, Moon, Grid, Maximize2, HelpCircle, PieChart, MessageSquare, LogOut, User, Bell as BellIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const notifications = [
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
  ];

  const messages = [
    {
      id: 1,
      avatar: 'JD',
      avatarColor: 'bg-blue-500',
      name: 'John Doe',
      message: 'Sure, Sarah. What\'s the new policy?',
      time: '08:00 AM',
      read: true
    },
  ];

  const quickAccessMenu = [
    { label: 'Contacts', desc: 'View All the Contacts' },
    { label: 'Pipeline', desc: 'View All the Pipeline' },
    { label: 'Activities', desc: 'Activities' },
    { label: 'Analytics', desc: 'Analytics' },
  ];

  return (
    <header className="bg-white border-b border-border-light sticky top-0 z-20 shadow-sm transition-smooth">
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
            <button className="icon-btn p-2 hover:bg-gray-100 rounded  text-gray-600" title="Fullscreen">
              <Maximize2 size={20} />
            </button>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="icon-btn p-2 hover:bg-gray-100 rounded  text-gray-600" 
              title="Dark Mode"
            >
              <Moon size={20} />
            </button>

            {/* Quick Access Menu */}
            <div className="relative group">
              <button
                onClick={() => setShowQuickAccess(!showQuickAccess)}
                className="icon-btn p-2 hover:bg-teal-100 rounded  text-teal-600 group-hover:bg-teal-50"
                title="Quick Access"
              >
                <Grid size={20} />
              </button>
              
              {showQuickAccess && (
                <div className="dropdown-menu absolute right-0 mt-2 w-56 bg-white z-50">
                  <div className="p-2 space-y-2">
                    {quickAccessMenu.map((item, idx) => (
                      <div key={idx} className="menu-item p-3 hover:bg-teal-50 rounded  cursor-pointer group transition-smooth hover:scale-105 hover:translate-x-1">
                        <p className=" text-gray-900 text-xs  group-hover:text-teal-600 text-color-transition">{item.label}</p>
                        <p className="text-xs text-gray-500 group-hover:text-gray-600 text-color-transition">{item.desc}</p>
                        <div className="text-right mt-1">
                          <span className="text-teal-600 text-xs  group-hover:translate-x-1 inline-block transition-transform">›</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <button className="icon-btn p-2 hover:bg-purple-100 rounded  text-purple-600" title="Help">
              <HelpCircle size={20} />
            </button>

            {/* Analytics */}
            <button className="icon-btn p-2 hover:bg-yellow-100 rounded  text-yellow-600" title="Analytics">
              <PieChart size={20} />
            </button>

            {/* Messages */}
            <div className="relative group">
              <button
                onClick={() => setShowMessages(!showMessages)}
                className="icon-btn relative p-2 hover:bg-gray-100 rounded  text-gray-600"
                title="Messages"
              >
                <MessageSquare size={20} />
                <span className="notification-badge absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showMessages && (
                <div className="dropdown-menu absolute right-0 mt-2 w-80 bg-white z-50">
                  <div className="p-2 border-b border-border-light flex items-center justify-between">
                    <h3 className=" text-gray-900 text-xs ">Messages</h3>
                    <span className="text-xs bg-red-100 text-red  p-1  rounded-full  animate-pulse">1</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {messages.map((msg, idx) => (
                      <div key={msg.id} className="notification-item p-2 border-b border-border-light hover:bg-gray-50 transition-smooth cursor-pointer" style={{animationDelay: `${idx * 0.05}s`}}>
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full ${msg.avatarColor} flex items-center justify-center text-white text-xs  flex-shrink-0 hover-lift`}>
                            {msg.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs   text-gray-900">{msg.name}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{msg.message}</p>
                            <p className="text-xs text-[#1F2020] mt-1">{msg.time} • You</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative group">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="icon-btn relative p-2 hover:bg-gray-100 rounded  text-gray-600"
                title="Notifications"
              >
                <Bell size={20} />
                <span className="notification-badge absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="dropdown-menu absolute right-0 mt-2 w-96 bg-white z-50">
                  <div className="p-2 border-b border-border-light flex items-center justify-between">
                    <h3 className=" text-gray-900 text-xs ">Notifications</h3>
                    <button className="icon-btn p-1 hover:bg-gray-100 rounded transition-smooth">
                      <Settings size={16} className="text-gray-600" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif, idx) => (
                      <div key={notif.id} className="notification-item p-2 border-b border-border-light hover:bg-gray-50 transition-smooth cursor-pointer" style={{animationDelay: `${idx * 0.05}s`}}>
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full ${notif.avatarColor} flex items-center justify-center text-white text-xs  flex-shrink-0 hover-lift`}>
                            {notif.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs   text-gray-900">{notif.name}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-[#1F2020] mt-1">{notif.time}</p>
                          </div>
                          {!notif.read && <div className="notification-badge w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border-light text-center">
                    <button className="text-xs  text-gray-600 hover:text-red    transition-smooth hover:scale-105">
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative group">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center p-1 hover:bg-gray-100 rounded  transition-smooth"
                title="Profile"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-white text-xs   border-2 border-green-400 hover-lift">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {showProfile && (
                <div className="dropdown-menu absolute right-0 mt-2 w-56 bg-white z-50 rounded  shadow-lg">
                  <div className="p-2 border-b border-border-light bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-white text-xs   hover-lift">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs   text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-600">{user?.role || 'Member'}{user?.department ? ` • ${user.department}` : ''}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="menu-item w-full text-left p-2  text-xs  text-gray-700 hover:bg-blue-50 rounded transition-smooth flex items-center gap-2 hover:text-white  hover:pl-5"
                    >
                      <User size={16} />
                      Profile Settings
                    </button>
                    <button className="menu-item w-full text-left p-2  text-xs  text-gray-700 hover:bg-purple-50 rounded transition-smooth flex items-center gap-2 hover:text-purple-600 hover:pl-5">
                      <BellIcon size={16} />
                      Notifications
                    </button>
                    <button className="menu-item w-full text-left p-2  text-xs  text-gray-700 hover:bg-green-50 rounded transition-smooth flex items-center gap-2 hover:text-green-600 hover:pl-5">
                      <HelpCircle size={16} />
                      Help & Support
                    </button>
                    <button className="menu-item w-full text-left p-2  text-xs  text-gray-700 hover:bg-orange-50 rounded transition-smooth flex items-center gap-2 hover:text-orange-600 hover:pl-5">
                      <Settings size={16} />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-border-light p-2">
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="menu-item w-full text-left p-2  text-xs  text-red  hover:bg-red-50 rounded transition-smooth  flex items-center gap-2 hover:pl-5"
                    >
                      <LogOut size={16} />
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

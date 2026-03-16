import React from 'react';
import { Bell, DollarSign, UserPlus, FileCheck, AlertCircle } from 'lucide-react';

const NotificationsPage = () => {
  const notifications = [
    { id: 1, title: 'New Deal Closed', message: 'You closed the deal with Tech Solutions for $5,000.', time: '2 hours ago', icon: <DollarSign size={16} className="text-green-600" />, bg: 'bg-green-50' },
    { id: 2, title: 'New Lead Assigned', message: 'A new lead "Global Marketing" has been assigned to you.', time: '5 hours ago', icon: <UserPlus size={16} className="text-white " />, bg: 'bg-blue-50' },
    { id: 3, title: 'Estimation Accepted', message: 'The estimation for "Finance Corp" has been accepted.', time: '1 day ago', icon: <FileCheck size={16} className="text-purple-600" />, bg: 'bg-purple-50' },
    { id: 4, title: 'Target Alert', message: 'You are at 85% of your monthly revenue target.', time: '2 days ago', icon: <AlertCircle size={16} className="text-orange-600" />, bg: 'bg-orange-50' },
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-[500] text-gray-900 mb-1">Notifications</h1>
          <div className="flex items-center gap-1 text-xs  text-gray-500">
            <span>Home</span>
            <span>&gt;</span>
            <span>Notifications</span>
          </div>
        </div>
        <button className="text-xs  text-[#F62416]  hover:underline">Mark all as read</button>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {notifications.map((note) => (
          <div key={note.id} className="bg-white p-2 rounded border border-gray-200 shadow-sm flex items-start gap-4 hover:border-gray-300 transition-colors">
            <div className={`p-2  rounded-full ${note.bg}`}>
              {note.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[14px]  text-gray-900">{note.title}</h3>
                <span className="text-[11px] text-[#1F2020]">{note.time}</span>
              </div>
              <p className="text-xs  text-gray-600">{note.message}</p>
              <div className="mt-3 flex gap-4">
                <button className="text-[12px] text-white   hover:underline">View Details</button>
                <button className="text-[12px] text-[#1F2020]  hover:text-gray-600">Dismiss</button>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20 bg-white rounded border border-gray-200 border-dashed">
            <Bell size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-[14px]">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

import React from 'react';
import { User, Mail, Phone, Lock, Bell, Shield, Camera } from 'lucide-react';

const ProfileSettingsPage = () => {
  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-xl font-[500] text-gray-900 mb-1">Profile Settings</h1>
        <div className="flex items-center gap-1 text-xs  text-gray-500">
          <span>Home</span>
          <span>&gt;</span>
          <span>Account Settings</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-1">
          {[
            { label: 'Personal Info', icon: <User size={18} />, active: true },
            { label: 'Notifications', icon: <Bell size={18} />, active: false },
            { label: 'Security', icon: <Shield size={18} />, active: false },
          ].map((item, idx) => (
            <button key={idx} className={`w-full flex items-center gap-3 p-2  rounded text-[14px]  transition ${
              item.active ? 'bg-[#F62416] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="flex-1 bg-white rounded border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-white  text-3xl  ">
                DR
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm hover:bg-gray-50">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h3 className="text-[18px]  text-gray-900">Darlee Robertson</h3>
              <p className="text-xs  text-gray-500">Sales Executive • London, UK</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px]  text-gray-500 mb-1.5">First Name</label>
              <input type="text" defaultValue="Darlee" className="w-full px-4 py-2 border border-gray-200 rounded text-xs  outline-none focus:border-[#F62416]" />
            </div>
            <div>
              <label className="block text-[12px]  text-gray-500 mb-1.5">Last Name</label>
              <input type="text" defaultValue="Robertson" className="w-full px-4 py-2 border border-gray-200 rounded text-xs  outline-none focus:border-[#F62416]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12px]  text-gray-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1F2020]" />
                <input type="email" defaultValue="darlee.robertson@company.com" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded text-xs  outline-none focus:border-[#F62416]" />
              </div>
            </div>
            <div>
              <label className="block text-[12px]  text-gray-500 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1F2020]" />
                <input type="text" defaultValue="+1 234 567 890" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded text-xs  outline-none focus:border-[#F62416]" />
              </div>
            </div>
            <div>
              <label className="block text-[12px]  text-gray-500 mb-1.5">Location</label>
              <input type="text" defaultValue="London, UK" className="w-full px-4 py-2 border border-gray-200 rounded text-xs  outline-none focus:border-[#F62416]" />
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-3">
            <button className="px-6 py-2 border border-gray-200 rounded text-xs  text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button className="px-6 py-2 bg-[#F62416] text-white rounded text-xs   hover:bg-[#D91E12] transition shadow-sm">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;

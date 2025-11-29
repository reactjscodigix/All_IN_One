import React, { useState } from 'react';
import { Download, Layout as LayoutIcon, Grid3x3 } from 'lucide-react';

const InvoicesPage = () => {
  const [invoices] = useState([
    {
      id: '#1465781',
      company: 'Truelyselli',
      companyLogo: '🎨',
      avatarBg: 'bg-orange-400',
      totalValue: '$2,15,000',
      dueDate: '22 Jun 2025',
      paidAmount: '$2,15,000',
      balanceAmount: '$0',
      status: 'Partially Paid',
      statusBg: 'bg-yellow-100',
      statusText: 'text-yellow-700',
      sentTo: 'BlueSky Industries',
      sentToLogo: '☁️'
    },
    {
      id: '#1465782',
      company: 'Dreamschat',
      companyLogo: '💬',
      avatarBg: 'bg-red-400',
      totalValue: '$1,45,000',
      dueDate: '20 May 2025',
      paidAmount: '$1,45,000',
      balanceAmount: '$0',
      status: 'Paid',
      statusBg: 'bg-green-100',
      statusText: 'text-green-700',
      sentTo: 'NovaWave LLC',
      sentToLogo: '🌊'
    },
    {
      id: '#1465783',
      company: 'DreamGigs',
      companyLogo: '🎭',
      avatarBg: 'bg-black',
      totalValue: '$2,15,000',
      dueDate: '30 Apr 2025',
      paidAmount: '$1,00,000',
      balanceAmount: '$1,15,000',
      status: 'Partially Paid',
      statusBg: 'bg-yellow-100',
      statusText: 'text-yellow-700',
      sentTo: 'Silver Hawk',
      sentToLogo: '🦅'
    },
    {
      id: '#1465784',
      company: 'Servbook',
      companyLogo: '📖',
      avatarBg: 'bg-purple-400',
      totalValue: '$4,80,380',
      dueDate: '21 Apr 2025',
      paidAmount: '$4,80,380',
      balanceAmount: '$0',
      status: 'Paid',
      statusBg: 'bg-green-100',
      statusText: 'text-green-700',
      sentTo: 'Summit Peak',
      sentToLogo: '⛰️'
    },
    {
      id: '#1465785',
      company: 'DreamPOS',
      companyLogo: '🛒',
      avatarBg: 'bg-green-400',
      totalValue: '$2,12,000',
      dueDate: '19 Mar 2025',
      paidAmount: '$0',
      balanceAmount: '$2,12,000',
      status: 'Unpaid',
      statusBg: 'bg-red-100',
      statusText: 'text-red-700',
      sentTo: 'RiverStone Ltd',
      sentToLogo: '🏞️'
    },
    {
      id: '#1465786',
      company: 'Kafejob',
      companyLogo: '☕',
      avatarBg: 'bg-cyan-400',
      totalValue: '$3,50,000',
      dueDate: '11 Mar 2025',
      paidAmount: '$1,50,000',
      balanceAmount: '$2,00,000',
      status: 'Partially Paid',
      statusBg: 'bg-yellow-100',
      statusText: 'text-yellow-700',
      sentTo: 'Bright Bridge Grp',
      sentToLogo: '🌉'
    },
    {
      id: '#1465787',
      company: 'SmartHR',
      companyLogo: '👥',
      avatarBg: 'bg-yellow-400',
      totalValue: '$2,46,000',
      dueDate: '17 Feb 2025',
      paidAmount: '$1,23,000',
      balanceAmount: '$1,23,000',
      status: 'Overdue',
      statusBg: 'bg-blue-100',
      statusText: 'text-blue-700',
      sentTo: 'CoastalStar Co.',
      sentToLogo: '🏖️'
    },
    {
      id: '#1465788',
      company: 'Docure',
      companyLogo: '📋',
      avatarBg: 'bg-cyan-400',
      totalValue: '$3,12,500',
      dueDate: '07 Feb 2025',
      paidAmount: '$3,12,500',
      balanceAmount: '$0',
      status: 'Paid',
      statusBg: 'bg-green-100',
      statusText: 'text-green-700',
      sentTo: 'HarborView',
      sentToLogo: '⛵'
    },
    {
      id: '#1465789',
      company: 'Best@laundry',
      companyLogo: '🧺',
      avatarBg: 'bg-purple-500',
      totalValue: '$4,18,000',
      dueDate: '20 Jan 2025',
      paidAmount: '$0',
      balanceAmount: '$4,18,000',
      status: 'Unpaid',
      statusBg: 'bg-red-100',
      statusText: 'text-red-700',
      sentTo: 'Golden Gate Ltd',
      sentToLogo: '🌉'
    },
    {
      id: '#1465790',
      company: 'Dreamsports',
      companyLogo: '⚽',
      avatarBg: 'bg-orange-500',
      totalValue: '$5,00,000',
      dueDate: '18 Jan 2025',
      paidAmount: '$5,00,000',
      balanceAmount: '$0',
      status: 'Paid',
      statusBg: 'bg-green-100',
      statusText: 'text-green-700',
      sentTo: 'Redwood Inc',
      sentToLogo: '🌲'
    },
    {
      id: '#1465791',
      company: 'Dreamsgigs',
      companyLogo: '🎵',
      avatarBg: 'bg-green-500',
      totalValue: '$5,00,000',
      dueDate: '19 Jan 2025',
      paidAmount: '$2,15,000',
      balanceAmount: '$2,85,000',
      status: 'Partially Paid',
      statusBg: 'bg-yellow-100',
      statusText: 'text-yellow-700',
      sentTo: 'Acme Corp.',
      sentToLogo: '🏢'
    },
    {
      id: '#1465792',
      company: 'SmartHR',
      companyLogo: '👥',
      avatarBg: 'bg-yellow-400',
      totalValue: '$2,46,000',
      dueDate: '17 Feb 2025',
      paidAmount: '$1,23,000',
      balanceAmount: '$1,23,000',
      status: 'Overdue',
      statusBg: 'bg-blue-100',
      statusText: 'text-blue-700',
      sentTo: 'CoastalStar Co.',
      sentToLogo: '🏖️'
    }
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-5xl font-bold text-gray-900">Invoices</h1>
              <span className="bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold">125</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <button className="hover:text-gray-900">Home</button>
              <span className="text-gray-400">›</span>
              <span className="text-gray-600">Invoices</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="border border-gray-300 px-5 py-2.5 rounded-lg bg-white text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-gray-50 transition">
              <Download size={18} />
              Export
            </button>
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white shadow-sm">
              <button className="p-2 hover:bg-gray-100 rounded transition">
                <LayoutIcon size={18} className="text-gray-600" />
              </button>
              <button className="p-2 bg-gray-100 rounded transition">
                <Grid3x3 size={18} className="text-gray-700" />
              </button>
            </div>
            <button className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-red-700 transition">
              + Add New Invoice
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex items-center gap-3">
          <button className="border border-gray-300 px-4 py-2.5 rounded-lg bg-white text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
            🔍 Filter
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Keyword"
              className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm w-80 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">✕</button>
          </div>
        </div>

        {/* Invoice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {invoices.map((invoice, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-5 shadow border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-blue-600 cursor-pointer hover:text-blue-700">
                  {invoice.id}
                </span>
                <button className="text-gray-400 hover:text-gray-600 text-lg">⋮</button>
              </div>

              {/* Company Info */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-14 h-14 ${invoice.avatarBg} rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-sm`}>
                  {invoice.companyLogo}
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900">{invoice.company}</h4>
                  <p className="text-xs text-gray-600 font-medium">Sent to</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="space-y-3 mb-5 text-xs text-gray-700 flex-grow bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span className="text-gray-600 font-medium">Total Value :</span>
                  <span className="font-bold text-gray-900 text-sm">{invoice.totalValue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span className="text-gray-600 font-medium">Due Date :</span>
                  <span className="font-bold text-gray-900">{invoice.dueDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span className="text-gray-600 font-medium">Paid Amount :</span>
                  <span className="font-bold text-gray-900">{invoice.paidAmount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💵</span>
                  <span className="text-gray-600 font-medium">Balance Amount :</span>
                  <span className="font-bold text-gray-900">{invoice.balanceAmount}</span>
                </div>
              </div>

              {/* Status Badge and Sent To */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.statusBg} ${invoice.statusText}`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{invoice.sentToLogo}</span>
                  <p className="text-xs text-gray-600 font-medium">{invoice.sentTo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mb-10">
          <button className="bg-red-600 text-white px-12 py-3 rounded-lg shadow-sm hover:bg-red-700 transition text-base font-semibold flex items-center gap-2">
            🔄 Load More
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-8 pb-6 font-medium">
          Copyright © 2025 <span className="text-red-600 font-bold">Preadmin</span>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;

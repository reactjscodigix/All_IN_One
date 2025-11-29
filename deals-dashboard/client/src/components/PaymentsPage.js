import React, { useState } from 'react';
import { MoreVertical, Download, Filter as FilterIcon, Eye, Trash2, Search } from 'lucide-react';

const PaymentsPage = () => {
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const payments = [
    { id: '1', invoiceId: '#1254058', client: 'NovaWave LLC', clientIcon: '🔵', amount: 2500, dueDate: '15 Oct 2025', paymentMethod: 'Cash', transactionId: 'TXNID1234567890' },
    { id: '2', invoiceId: '#1254057', client: 'BlueSky Industries', clientIcon: '🔴', amount: 1450, dueDate: '19 Oct 2025', paymentMethod: 'Credit', transactionId: 'TXNID9876543210' },
    { id: '3', invoiceId: '#1254056', client: 'Silver Hawk', clientIcon: '🟢', amount: 2100, dueDate: '24 Oct 2025', paymentMethod: 'Cash', transactionId: 'TXNID2468135790' },
    { id: '4', invoiceId: '#1254055', client: 'Summit Peak', clientIcon: '🔷', amount: 4000, dueDate: '10 Nov 2025', paymentMethod: 'Credit', transactionId: 'TXNID1357924680' },
    { id: '5', invoiceId: '#1254054', client: 'RiverStone Ventur', clientIcon: '⬛', amount: 2120, dueDate: '18 Nov 2025', paymentMethod: 'Cash', transactionId: 'TXNID0123456789' },
    { id: '6', invoiceId: '#1254053', client: 'CoastalStar Co.', clientIcon: '🔵', amount: 3500, dueDate: '20 Nov 2025', paymentMethod: 'Credit', transactionId: 'TXNIDABCDE12345' },
    { id: '7', invoiceId: '#1254052', client: 'HarborView', clientIcon: '🟢', amount: 1230, dueDate: '07 Dec 2025', paymentMethod: 'Cash', transactionId: 'TXNID54321XYZ789' },
    { id: '8', invoiceId: '#1254051', client: 'Golden Gate Ltd', clientIcon: '🔴', amount: 3125, dueDate: '14 Dec 2025', paymentMethod: 'Credit', transactionId: 'TXNIDQWERTY0987' },
    { id: '9', invoiceId: '#1254050', client: 'Redwood Inc', clientIcon: '🟣', amount: 4180, dueDate: '22 Dec 2025', paymentMethod: 'Cash', transactionId: 'TXNID98765ASDF43' },
    { id: '10', invoiceId: '#1254049', client: 'NovaWave LLC', clientIcon: '🔵', amount: 5000, dueDate: '28 Dec 2025', paymentMethod: 'Cash', transactionId: 'TXNID1A2B3C4D5E6' },
  ];

  const togglePaymentSelection = (id) => {
    setSelectedPayments(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAllPayments = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(p => p.id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-5xl font-bold text-gray-900">Payments</h1>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">125</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button className="hover:text-gray-900 font-medium">Home</button>
              <span className="text-gray-400">›</span>
              <span className="text-gray-600">Payments</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="border border-gray-300 px-4 py-2 rounded-lg bg-white text-sm flex items-center gap-2 shadow hover:bg-gray-50 transition font-medium">
              <Download size={18} />
              Export
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Keyword"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Sort By</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="amount">Amount High to Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 border-l border-gray-300 pl-6 font-medium">
              📅 29 Nov 25 - 29 Nov 25
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                <FilterIcon size={16} /> Filter
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                Manage Columns
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === payments.length}
                      onChange={toggleAllPayments}
                      className="rounded border-gray-300 accent-red-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Invoice ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Payment Method</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => togglePaymentSelection(payment.id)}
                        className="rounded border-gray-300 accent-red-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-red-600">{payment.invoiceId}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{payment.clientIcon}</span>
                        <span className="text-sm font-semibold text-gray-900">{payment.client}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-base font-bold text-gray-900">${payment.amount}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-600 font-medium">{payment.dueDate}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${
                        payment.paymentMethod === 'Cash'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-600 font-medium">{payment.transactionId}</span>
                    </td>
                    <td className="px-6 py-5">
                      <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-0 text-sm text-gray-600 font-medium">
            <span>Show</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))} 
              className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer font-medium"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-sm font-medium transition">&lt;</button>
            <button className="border border-red-500 px-3 py-1.5 rounded bg-red-500 text-white font-bold text-sm">1</button>
            <button className="border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-sm font-medium transition">&gt;</button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm border-t border-gray-200 mt-8 pt-6">
          Copyright © 2025 <span className="text-red-600 font-bold">Preadmin</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;

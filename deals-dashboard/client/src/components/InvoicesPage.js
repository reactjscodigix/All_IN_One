import React, { useState } from 'react';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';

const InvoicesPage = () => {
  const [invoices] = useState([
    { id: 'INV-1454', name: 'Anthony Lewis', email: 'anthony@example.com', date: '14 Jan 2024, 04:27 AM', total: '$300', due: '$0', dueDate: '14 Jan 2024, 04:27 AM', status: 'Paid', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-01.jpg' },
    { id: 'INV-6571', name: 'Brian Villalobos', email: 'brian@example.com', date: '21 Jan 2024, 03:19 AM', total: '$547', due: '$200', dueDate: '21 Jan 2024, 03:19 AM', status: 'Overdue', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-09.jpg' },
    { id: 'INV-2245', name: 'Harvey Smith', email: 'harvey@example.com', date: '20 Feb 2024, 12:15 PM', total: '$325', due: '$65', dueDate: '20 Feb 2024, 12:15 PM', status: 'Pending', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-01.jpg' },
    { id: 'INV-1456', name: 'Stephan Peralt', email: 'peral@example.com', date: '15 Mar 2024, 12:11 AM', total: '$471', due: '$145', dueDate: '15 Mar 2024, 12:11 AM', status: 'Pending', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-02.jpg' },
    { id: 'INV-0045', name: 'Doglas Martini', email: 'martniwr@example.com', date: '12 Apr 2024, 05:48 PM', total: '$147', due: '$32', dueDate: '12 Apr 2024, 05:48 PM', status: 'Overdue', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-03.jpg' },
    { id: 'INV-6244', name: 'Linda Ray', email: 'ray456@example.com', date: '20 Apr 2024, 06:11 PM', total: '$654', due: '$140', dueDate: '20 Apr 2024, 06:11 PM', status: 'Draft', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-02.jpg' },
    { id: 'INV-9565', name: 'Elliot Murray', email: 'murray@example.com', date: '14 Jan 2024, 04:27 AM', total: '$300', due: '$0', dueDate: '14 Jan 2024, 04:27 AM', status: 'Paid', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-06.jpg' },
    { id: 'INV-6874', name: 'Rebecca Smith', email: 'smith@example.com', date: '02 Sep 2024, 09:21 PM', total: '$654', due: '$65', dueDate: '02 Sep 2024, 09:21 PM', status: 'Paid', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-07.jpg' },
    { id: 'INV-1454b', name: 'Anthony Lewis', email: 'anthony@example.com', date: '14 Jan 2024, 04:27 AM', total: '$300', due: '$0', dueDate: '14 Jan 2024, 04:27 AM', status: 'Draft', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-08.jpg' },
    { id: 'INV-6587', name: 'Connie Waters', email: 'connie@example.com', date: '15 Nov 2024, 12:44 PM', total: '$987', due: '$47', dueDate: '15 Nov 2024, 12:44 PM', status: 'Pending', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-09.jpg' },
    { id: 'INV-5879', name: 'Lori Broaddus', email: 'broaddus@example.com', date: '10 Dec 2024, 11:23 PM', total: '$365', due: '$21', dueDate: '10 Dec 2024, 11:23 PM', status: 'Overdue', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/users/user-10.jpg' }
  ]);

  const getStatusBadge = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-700 border border-green-300',
      'Pending': 'bg-orange-100 text-orange-700 border border-orange-300',
      'Overdue': 'bg-red-100 text-red-700 border border-red-300',
      'Draft': 'bg-yellow-100 text-yellow-700 border border-yellow-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const stats = [
    { label: 'Total Invoice', value: '$3,237.94', change: '+32.40% from last month', color: 'border-blue-500' },
    { label: 'Outstanding', value: '$3,237.94', change: '-4.40% from last month', color: 'border-red-500' },
    { label: 'Draft', value: '$3,237.94', change: '+12% from last month', color: 'border-yellow-500' },
    { label: 'Total Overdue', value: '$3,237.94', change: '-15.40% from last month', color: 'border-orange-500' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <button className="text-gray-600 hover:text-gray-900">Home</button>
              <span>›</span>
              <button className="text-gray-600 hover:text-gray-900">Applications</button>
              <span>›</span>
              <span>Invoices</span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-smooth font-medium text-sm">
            <Plus size={18} />
            Add Invoices
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border-l-4" style={{ borderLeftColor: stat.color.split('-')[1] === 'blue' ? '#3b82f6' : stat.color.split('-')[1] === 'red' ? '#ef4444' : stat.color.split('-')[1] === 'yellow' ? '#eab308' : '#f97316' }}>
              <p className="text-xs text-gray-600 font-medium mb-2">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
              <div className="h-1 bg-gray-200 rounded-full mb-2" style={{ background: stat.color.split('-')[1] === 'blue' ? '#3b82f6' : stat.color.split('-')[1] === 'red' ? '#ef4444' : stat.color.split('-')[1] === 'yellow' ? '#eab308' : '#f97316', width: '60%' }}></div>
              <p className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-green-600'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Invoices</h2>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">2000 Invoices</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="w-4 h-4" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Created On</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Amount Due</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, idx) => (
                  <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm font-medium text-red-600 hover:text-red-700">{invoice.id}</button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img src={invoice.avatar} alt={invoice.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{invoice.name}</p>
                          <p className="text-xs text-gray-600">{invoice.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{invoice.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.total}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{invoice.due}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{invoice.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;

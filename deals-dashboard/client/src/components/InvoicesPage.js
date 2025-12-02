import React, { useState, useEffect } from 'react';
import { Download, Layout as LayoutIcon, Grid3x3 } from 'lucide-react';
import AddNewInvoiceModal from './AddNewInvoiceModal';
import { invoicesAPI, companiesAPI } from '../services/api';

const InvoicesPage = () => {
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [invoicesData, companiesData] = await Promise.all([
          invoicesAPI.getAll(),
          companiesAPI.getAll()
        ]);
        setInvoices(invoicesData || []);
        setCompanies(companiesData || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load invoices');
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusStyles = (status) => {
    const statusMap = {
      'Paid': { bg: 'bg-green-100', text: 'text-green-700' },
      'Partially Paid': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'Unpaid': { bg: 'bg-red-100', text: 'text-red-700' },
      'Overdue': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-700' },
      'Sent': { bg: 'bg-purple-100', text: 'text-purple-700' },
    };
    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const getCompanyLogo = (companyName) => {
    const logoMap = {
      'Truelyselli': '🎨',
      'Dreamschat': '💬',
      'DreamGigs': '🎭',
      'Servbook': '📖',
      'DreamPOS': '🛒',
      'Kafejob': '☕',
      'SmartHR': '👥',
      'Docure': '📋',
      'Best@laundry': '🧺',
      'Dreamsports': '⚽',
    };
    return logoMap[companyName] || '🏢';
  };

  const getAvatarBg = (index) => {
    const colors = [
      'bg-orange-400', 'bg-red-400', 'bg-black', 'bg-purple-400',
      'bg-green-400', 'bg-cyan-400', 'bg-yellow-400', 'bg-purple-500',
      'bg-orange-500', 'bg-green-500'
    ];
    return colors[index % colors.length];
  };

  const formatCurrency = (value, currency = 'USD') => {
    if (!value) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(num);
  };

  const handleAddInvoice = async (formData) => {
    try {
      const response = await invoicesAPI.create(formData);
      
      const newInvoice = {
        id: response.id,
        invoice_number: response.invoiceNumber,
        client_id: formData.client,
        company_name: companies.find(c => c.id === formData.client)?.company_name || 'Unknown',
        bill_to: formData.billTo,
        ship_to: formData.shipTo,
        amount: formData.amount,
        currency: formData.currency,
        invoice_date: formData.date,
        open_till: formData.openTill,
        payment_method: formData.paymentMethod,
        status: formData.status || 'Draft',
        total: formData.total || formData.amount,
      };

      setInvoices([newInvoice, ...invoices]);
      setShowAddInvoiceModal(false);
    } catch (err) {
      console.error('Error creating invoice:', err);
      throw err;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-5xl font-bold text-gray-900">Invoices</h1>
              <span className="bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold">
                {invoices.length}
              </span>
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
            <button 
              onClick={() => setShowAddInvoiceModal(true)}
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-red-700 transition">
              + Add New Invoice
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading invoices...</p>
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-600 font-medium text-lg">No invoices yet</p>
              <p className="text-gray-500 text-sm mt-2">Click "Add New Invoice" to create your first invoice</p>
            </div>
          </div>
        ) : (
          <>
            {/* Invoice Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {invoices.map((invoice, idx) => {
                const statusStyles = getStatusStyles(invoice.status);
                const companyName = invoice.company_name || 'Unknown';
                const companyLogo = getCompanyLogo(companyName);
                const avatarBg = getAvatarBg(idx);
                
                return (
                  <div 
                    key={invoice.id} 
                    className="bg-white rounded-2xl p-5 shadow border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-blue-600 cursor-pointer hover:text-blue-700">
                        {invoice.invoice_number || `#${invoice.id}`}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 text-lg">⋮</button>
                    </div>

                    {/* Company Info */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-14 h-14 ${avatarBg} rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-sm`}>
                        {companyLogo}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-gray-900">{companyName}</h4>
                        <p className="text-xs text-gray-600 font-medium">Invoice</p>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="space-y-3 mb-5 text-xs text-gray-700 flex-grow bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span>📄</span>
                        <span className="text-gray-600 font-medium">Total Value :</span>
                        <span className="font-bold text-gray-900 text-sm">
                          {formatCurrency(invoice.total || invoice.amount, invoice.currency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span className="text-gray-600 font-medium">Due Date :</span>
                        <span className="font-bold text-gray-900">
                          {invoice.open_till ? new Date(invoice.open_till).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span className="text-gray-600 font-medium">Amount :</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💵</span>
                        <span className="text-gray-600 font-medium">Balance :</span>
                        <span className="font-bold text-gray-900">$0</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles.bg} ${statusStyles.text}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{invoice.payment_method ? '💳' : '📋'}</span>
                        <p className="text-xs text-gray-600 font-medium">
                          {invoice.payment_method || invoice.bill_to || 'No details'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mb-10">
              <button className="bg-red-600 text-white px-12 py-3 rounded-lg shadow-sm hover:bg-red-700 transition text-base font-semibold flex items-center gap-2">
                🔄 Load More
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-8 pb-6 font-medium">
          Copyright © 2025 <span className="text-red-600 font-bold">Preadmin</span>
        </div>
      </div>

      {/* Add New Invoice Modal */}
      <AddNewInvoiceModal 
        isOpen={showAddInvoiceModal}
        onClose={() => setShowAddInvoiceModal(false)}
        onSubmit={handleAddInvoice}
        companies={companies}
      />
    </div>
  );
};

export default InvoicesPage;

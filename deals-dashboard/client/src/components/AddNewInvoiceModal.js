import React, { useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';

const AddNewInvoiceModal = ({ isOpen, onClose, onSubmit, companies = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openPanels, setOpenPanels] = useState({
    basic: true,
    items: true,
    totals: true,
    notes: true,
  });

  const [formData, setFormData] = useState({
    client: '',
    billTo: '',
    shipTo: '',
    project: '',
    amount: '',
    currency: 'USD',
    date: '',
    openTill: '',
    paymentMethod: '',
    status: '',
    description: '',
    items: [{ item: '', quantity: '', price: '', discount: '0%', amount: '' }],
    subtotal: '$0.00',
    discount2: '$18',
    extraDiscount0: '$18',
    tax: '$18',
    total: '$18',
    notes: '',
    termsConditions: '',
  });

  const togglePanel = (name) => {
    setOpenPanels((p) => ({ ...p, [name]: !p[name] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addNewItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item: '', quantity: '', price: '', discount: '0%', amount: '' }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.client || !formData.billTo || !formData.amount) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      handleCancel();
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      client: '',
      billTo: '',
      shipTo: '',
      project: '',
      amount: '',
      currency: 'USD',
      date: '',
      openTill: '',
      paymentMethod: '',
      status: '',
      description: '',
      items: [{ item: '', quantity: '', price: '', discount: '0%', amount: '' }],
      subtotal: '$0.00',
      discount2: '$18',
      extraDiscount0: '$18',
      tax: '$18',
      total: '$18',
      notes: '',
      termsConditions: '',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={handleCancel}>
      <div 
        className="h-full w-full md:w-[80%] lg:w-[70%] xl:w-[65%] bg-white shadow-xl overflow-y-auto border-l border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-[#EAECF0] sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Add New Invoice</h2>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-600 transition-colors text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form id="add-invoice-form" onSubmit={handleSubmit} className="p-6 space-y-0">
          
          {/* Basic Invoice Info Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('basic')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  📋
                </div>
                <span className="font-semibold text-gray-900 text-sm">Invoice Details</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.basic ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.basic && (
              <div className="px-4 py-5 space-y-5 border-t border-[#EAECF0] bg-white">
                
                {/* Client & Bill To */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="client"
                      value={formData.client}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Select Client</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end mt-1">
                      <button type="button" className="text-red-500 text-sm font-medium hover:text-red-700">
                        + Add New
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="billTo"
                      value={formData.billTo}
                      onChange={handleInputChange}
                      placeholder="Enter billing address"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                {/* Ship To & Project */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ship To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shipTo"
                      value={formData.shipTo}
                      onChange={handleInputChange}
                      placeholder="Enter shipping address"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Select Project</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end mt-1">
                      <button type="button" className="text-red-500 text-sm font-medium hover:text-red-700">
                        + Add New
                      </button>
                    </div>
                  </div>
                </div>

                {/* Amount & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                {/* Date & Open Till */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="text"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      placeholder="dd/mm/yyyy"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Open Till <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="openTill"
                      value={formData.openTill}
                      onChange={handleInputChange}
                      placeholder="dd/mm/yyyy"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                {/* Payment Method & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Select</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Check">Check</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Select</option>
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                    <div className="flex items-center gap-1 bg-gray-50 border-b border-[#E5E7EB] p-2">
                      <select className="px-2 py-1 text-xs border border-[#E5E7EB] rounded bg-white">
                        <option>Normal</option>
                      </select>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">B</button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600 italic">I</button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600 underline">U</button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">🔗</button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">☰</button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600">⋮</button>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter invoice description"
                      rows="4"
                      className="w-full px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('items')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  📦
                </div>
                <span className="font-semibold text-gray-900 text-sm">Line Items</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.items ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.items && (
              <div className="px-4 py-5 space-y-4 border-t border-[#EAECF0] bg-white">
                
                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="text-left text-xs font-semibold text-gray-700 py-3 px-2">Item</th>
                        <th className="text-left text-xs font-semibold text-gray-700 py-3 px-2">Quantity</th>
                        <th className="text-left text-xs font-semibold text-gray-700 py-3 px-2">Price</th>
                        <th className="text-left text-xs font-semibold text-gray-700 py-3 px-2">Discount</th>
                        <th className="text-left text-xs font-semibold text-gray-700 py-3 px-2">Amount</th>
                        <th className="text-center text-xs font-semibold text-gray-700 py-3 px-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b border-[#E5E7EB]">
                          <td className="py-3 px-2">
                            <input
                              type="text"
                              value={item.item}
                              onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                              placeholder="Item name"
                              className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded text-sm bg-white focus:outline-none focus:border-red-500"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded text-sm bg-white focus:outline-none focus:border-red-500"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              placeholder="0.00"
                              className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded text-sm bg-white focus:outline-none focus:border-red-500"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <select
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                              className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded text-sm bg-white focus:outline-none focus:border-red-500"
                            >
                              <option value="0%">0%</option>
                              <option value="5%">5%</option>
                              <option value="10%">10%</option>
                              <option value="15%">15%</option>
                              <option value="20%">20%</option>
                            </select>
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="text"
                              value={item.amount}
                              readOnly
                              placeholder="0.00"
                              className="w-full px-2 py-1.5 border border-[#E5E7EB] rounded text-sm bg-gray-50"
                            />
                          </td>
                          <td className="py-3 px-2 text-center">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700 transition"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add New Item Button */}
                <button
                  type="button"
                  onClick={addNewItem}
                  className="text-red-500 text-sm font-medium hover:text-red-700 flex items-center gap-1 transition"
                >
                  <Plus size={16} />
                  Add New
                </button>
              </div>
            )}
          </div>

          {/* Totals Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('totals')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  💰
                </div>
                <span className="font-semibold text-gray-900 text-sm">Totals</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.totals ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.totals && (
              <div className="px-4 py-5 space-y-3 border-t border-[#EAECF0] bg-white">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-semibold">{formData.subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">Discount 2%</span>
                  <span className="text-gray-900 font-semibold">{formData.discount2}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">Extra Discount 0%</span>
                  <span className="text-gray-900 font-semibold">{formData.extraDiscount0}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-[#E5E7EB] pt-3">
                  <span className="text-gray-700 font-medium">Tax</span>
                  <span className="text-gray-900 font-semibold">{formData.tax}</span>
                </div>
                <div className="flex items-center justify-between text-base border-t border-[#E5E7EB] pt-3">
                  <span className="text-gray-900 font-semibold">Total</span>
                  <span className="text-gray-900 font-bold text-lg">{formData.total}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('notes')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  📝
                </div>
                <span className="font-semibold text-gray-900 text-sm">Notes & Terms</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.notes ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.notes && (
              <div className="px-4 py-5 space-y-5 border-t border-[#EAECF0] bg-white">
                
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter any additional notes"
                    rows="3"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition resize-none"
                  />
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="termsConditions"
                    value={formData.termsConditions}
                    onChange={handleInputChange}
                    placeholder="Enter terms and conditions"
                    rows="3"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewInvoiceModal;

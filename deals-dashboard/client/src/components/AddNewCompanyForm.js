import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

const AddNewCompanyForm = ({ isOpen, onClose, onSubmit }) => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    logo: null,
    logoPreview: null,
    companyName: '',
    emailAddress: '',
    accountUrl: '',
    phoneNumber: '',
    website: '',
    password: '',
    confirmPassword: '',
    address: '',
    planName: '',
    planType: '',
    currency: '',
    language: '',
    status: 'Active',
  });

  const plans = ['Basic', 'Professional', 'Enterprise', 'Custom'];
  const planTypes = ['Monthly', 'Yearly', 'Lifetime'];
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.companyName || !formData.phoneNumber || !formData.password || !formData.planName || !formData.planType) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      handleCancel();
    } catch (err) {
      setError(err.message || 'Failed to create company');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      logo: null,
      logoPreview: null,
      companyName: '',
      emailAddress: '',
      accountUrl: '',
      phoneNumber: '',
      website: '',
      password: '',
      confirmPassword: '',
      address: '',
      planName: '',
      planType: '',
      currency: '',
      language: '',
      status: 'Active',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={handleCancel}>
      <div 
        className="h-full w-full md:w-[72%] lg:w-[60%] xl:w-[55%] bg-white shadow-xl overflow-y-auto border-l border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Add New Company</h2>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-600 transition-colors text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form id="add-company-form" onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          
          {/* Logo Upload */}
          <div className="md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {formData.logoPreview ? (
                  <img src={formData.logoPreview} alt="Company logo" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Upload size={16} />
                  Upload file
                </button>
                <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Enter company name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Account URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account URL
            </label>
            <input
              type="url"
              name="accountUrl"
              value={formData.accountUrl}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter company address"
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400 resize-none"
            />
          </div>

          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name <span className="text-red-500">*</span>
            </label>
            <select
              name="planName"
              value={formData.planName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            >
              <option value="">Select</option>
              {plans.map(plan => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
          </div>

          {/* Plan Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Type <span className="text-red-500">*</span>
            </label>
            <select
              name="planType"
              value={formData.planType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            >
              <option value="">Select</option>
              {planTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            >
              <option value="">Choose</option>
              {currencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-gray-400"
            >
              <option value="">Choose</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Status
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={formData.status === 'Active'}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={formData.status === 'Inactive'}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>
        </form>

        <div className="p-6 flex justify-end gap-3 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Creating...
              </>
            ) : (
              'Create New'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewCompanyForm;

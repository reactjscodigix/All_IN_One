import React, { useState } from 'react';

const defaultOptions = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'Custom Range'];

const DateRangeDropdown = ({ value, onChange, onDateRangeChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const dropdownOptions = options && options.length > 0 ? options : defaultOptions;

  const handleOptionClick = (option) => {
    if (option === 'Custom Range') {
      setShowDatePicker(true);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const handleDateRangeApply = () => {
    if (startDate && endDate) {
      onChange('Custom Range');
      if (onDateRangeChange) {
        onDateRangeChange({ startDate, endDate });
      }
      setShowDatePicker(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 border border-1 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
          isOpen
            ? 'bg-red-500 text-white border-red-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-red-500 hover:text-white hover:border-red-500'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {value}
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fadeIn">
          {dropdownOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                value === option
                  ? 'bg-red-500 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              } first:rounded-t-lg last:rounded-b-lg`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-2 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date Range</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setIsOpen(false);
                  setStartDate('');
                  setEndDate('');
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDateRangeApply}
                disabled={!startDate || !endDate}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeDropdown;

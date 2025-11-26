import React, { useState } from 'react';
import DateRangeDropdown from './DateRangeDropdown';

const RecentProjectsTable = ({ projects, onDateRangeChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 Days');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border-light">
      <div className="py-[0.9375rem] px-[1.25rem] border-b border-border-light">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <div className="flex items-center gap-2">
            <DateRangeDropdown
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              onDateRangeChange={onDateRangeChange}
              options={['Last 15 Days', 'Last 30 Days']}
            />
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              title="Add Project"
            >
              <span>● Add Project</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border-light">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {projects.slice(0, 5).map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-xs font-medium text-gray-900">{project.name}</td>
                <td className="p-3 text-xs text-gray-600">{project.company}</td>
                <td className="p-3 text-xs">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    ● {project.priority}
                  </span>
                </td>
                <td className="p-3 text-xs text-gray-600">{formatDate(project.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">No projects found</p>
        </div>
      )}
    </div>
  );
};

export default RecentProjectsTable;

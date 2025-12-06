import React, { useState } from 'react';
import DateRangeDropdown from './DateRangeDropdown';
import AddProjectModal from './AddProjectModal';

const RecentProjectsTable = ({ projects, onDateRangeChange, onAddProject, onViewProjectDetails, onViewCompanyDetails }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 Days');
  const [showAddModal, setShowAddModal] = useState(false);

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
              onClick={() => setShowAddModal(true)}
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-1/3">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-1/4">Company</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-1/4">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-1/6">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {projects.slice(0, 5).map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate">
                  <button
                    type="button"
                    onClick={() => onViewProjectDetails && onViewProjectDetails(project.id)}
                    className="text-blue-600 hover:text-blue-700 hover:underline truncate"
                    title={project.name}
                  >
                    {project.name || '-'}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {project.company ? (
                    <button
                      type="button"
                      onClick={() => onViewCompanyDetails && onViewCompanyDetails(project.company)}
                      className="inline-flex items-center gap-2 px-2 py-1 rounded bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors truncate"
                      title={project.company}
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
                      <span className="truncate">{project.company}</span>
                    </button>
                  ) : (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(project.dueDate)}</td>
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

      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(formData) => {
          if (onAddProject) {
            onAddProject(formData);
          }
          setShowAddModal(false);
        }}
      />
    </div>
  );
};

export default RecentProjectsTable;

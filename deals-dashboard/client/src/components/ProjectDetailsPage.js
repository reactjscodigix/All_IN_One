import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';

const ProjectDetailsPage = ({ projectId, onBack }) => {
  const [activeTab, setActiveTab] = useState('activities');

  const projectData = {
    id: '154454887',
    name: 'Truelysell',
    status: 'Completed',
    priority: 'High',
    isPrivate: true,
    startDate: '27 Sep 2025, 11:45 PM',
    dueDate: '27 Sep 2025, 11:45 PM',
    dealValue: '$25,11,145',
    projectType: 'Mobile Application',
    projectTiming: 'Hourly',
    client: {
      name: 'Jessica Sen',
      avatar: 'JS'
    },
    responsiblePersons: [
      { name: 'Robert Johnson', initials: 'RJ', color: 'bg-purple-500' },
      { name: 'Sarah Chen', initials: 'SC', color: 'bg-cyan-500' },
      { name: 'Emily Davis', initials: 'ED', color: 'bg-pink-500' }
    ],
    teamLeader: {
      name: 'Jessica Sen',
      avatar: 'JS'
    },
    pipeline: 'Marketing Pipeline',
    lastModified: '27 Sep 2025, 11:45 PM',
    modifiedBy: 'Darlee Robertson',
    pipelineStatus: [
      { name: 'Plan', color: '#4b4efc', status: 'active' },
      { name: 'Design', color: '#1fa1ff', status: 'active' },
      { name: 'Development', color: '#26c259', status: 'active' },
      { name: 'Completed', color: '#ff6a3d', status: 'completed' }
    ],
    activities: [
      {
        id: 1,
        date: '28 May 2025',
        items: [
          {
            id: 'a1',
            type: 'message',
            title: 'You sent 1 Message to the contact.',
            timestamp: '10:25 pm',
            iconBg: '#e5f0ff',
            iconColor: '#2867ff',
            icon: '📩'
          },
          {
            id: 'a2',
            type: 'call',
            title: 'Denwar responded to your appointment schedule by call at 09:30pm.',
            timestamp: '09:25 pm',
            iconBg: '#e8f9ef',
            iconColor: '#3bb54a',
            icon: '📞'
          },
          {
            id: 'a3',
            type: 'note',
            title: 'Notes added by Antony',
            description: 'Please accept my apologies for the inconvenience caused. It would be much appreciated if it\'s possible to reschedule to 6:00 PM, or any other day that week.',
            timestamp: '10:00 pm',
            iconBg: '#fde8e8',
            iconColor: '#e63535',
            icon: '📝'
          }
        ]
      },
      {
        id: 2,
        date: '27 May 2025',
        items: [
          {
            id: 'a4',
            type: 'meeting',
            title: 'Meeting With Abraham',
            description: 'Scheduled on 05:00 pm',
            timestamp: '05:00 pm',
            iconBg: '#fff4e5',
            iconColor: '#f3a009',
            icon: '👥'
          },
          {
            id: 'a5',
            type: 'call',
            title: 'Drain responded to your appointment schedule question.',
            timestamp: '09:25 pm',
            iconBg: '#e8f9ef',
            iconColor: '#3bb54a',
            icon: '📞'
          }
        ]
      }
    ],
    upcomingActivity: {
      title: 'Product Meeting',
      description: 'A product team meeting is a gathering of the cross-functional product team – ideally including team members from product, engineering, marketing, and customer support.',
      timestamp: '25 Jul 2023, 05:00 pm',
      iconBg: '#fff4e5',
      iconColor: '#f3a009',
      icon: '📌',
      reminder: '1 hr',
      priority: 'High',
      assignedTo: 'Jerald Sen'
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* TITLE + COUNT */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-semibold flex items-center gap-2">
          Projects
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-md">
            125
          </span>
        </h1>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 flex items-center gap-2 mb-4">
        <span>Home</span>
        <span>/</span>
        <span className="text-gray-700">Projects</span>
      </div>

      {/* BACK BUTTON */}
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeWidth="2" d="M15 18l-6-6 6-6" />
        </svg>
        Back to Projects
      </button>

      {/* PROJECT CARD */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0">
            T
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">{projectData.name}</h2>
              <p className="text-sm text-gray-600">
                Project Id :{" "}
                <span className="text-gray-800 font-semibold">{projectData.id}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-600 font-semibold">
                High
              </span>

              <span className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-600 font-semibold">
                Active
              </span>

              <span className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-600 font-semibold">
                Private
              </span>

              <button className="px-3 py-1 text-xs rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition">
                ✓ Completed
              </button>

              <button className="text-red-500 hover:text-red-600 p-1 ml-1 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-6">
        {/* Left Sidebar (27%) */}
        <div className="w-80 space-y-5">
          {/* Project Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Project Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500 font-medium">Start Date</span>
                <span className="text-sm font-medium text-gray-900">{projectData.startDate}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500 font-medium">Due Date</span>
                <span className="text-sm font-medium text-gray-900">{projectData.dueDate}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500 font-medium">Deal Value</span>
                <span className="text-sm font-bold text-gray-900">{projectData.dealValue}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500 font-medium">Project Type</span>
                <span className="text-sm font-medium text-gray-900">{projectData.projectType}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500 font-medium">Project Timing</span>
                <span className="text-sm font-medium text-gray-900">{projectData.projectTiming}</span>
              </div>
            </div>
          </div>

          {/* Client Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Client</h3>
              <button className="text-red-500 hover:text-red-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {projectData.client.avatar}
              </div>
              <span className="text-sm text-gray-900">{projectData.client.name}</span>
            </div>
          </div>

          {/* Responsible Persons Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Responsible Persons</h3>
              <button className="text-red-500 hover:text-red-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              {projectData.responsiblePersons.map((person, index) => (
                <div key={index} className={`w-8 h-8 ${person.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                  {person.initials[0]}
                </div>
              ))}
              <span className="text-xs text-gray-500 ml-1 font-medium">+1</span>
            </div>
          </div>

          {/* Team Leader Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Team Leader</h3>
              <button className="text-red-500 hover:text-red-600 text-xs font-medium">Change</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {projectData.teamLeader.avatar}
              </div>
              <span className="text-sm text-gray-900">{projectData.teamLeader.name}</span>
            </div>
          </div>

          {/* Pipeline Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Pipeline</h3>
            <div className="text-sm text-gray-600 mb-3 font-medium">{projectData.pipeline}</div>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500">Last Modified</span>
                <span className="text-xs font-medium text-gray-900">{projectData.lastModified}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500">Modified By</span>
                <span className="text-xs font-medium text-gray-900">{projectData.modifiedBy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Main Content */}
        <div className="flex-1 space-y-5">
          {/* Pipeline Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Project Pipeline Status</h3>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {projectData.pipelineStatus.map((step, index) => (
                  <div
                    key={index}
                    className="pipeline-step"
                    style={{ backgroundColor: step.color }}
                  >
                    <span>{step.name}</span>
                  </div>
                ))}
              </div>
            </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex gap-8 px-6 border-b border-gray-200">
              {['Activities', 'Notes', 'Calls', 'Files', 'Email'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'text-red-500 border-b-2 border-red-500'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Activities Content */}
            <div className="p-5">
              {activeTab === 'activities' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Activities</h3>
                    <button className="flex items-center gap-2 border border-gray-300 px-3 py-1.5 rounded-md text-xs text-gray-700 hover:bg-gray-50 font-medium">
                      Sort By
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                  </div>

                  {projectData.activities.map((dateGroup) => (
                    <div key={dateGroup.id} className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#e3ebff', color: '#3d5afe' }}>
                        📅 {dateGroup.date}
                      </div>
                      
                      {dateGroup.items.map((activity) => (
                        <div key={activity.id} className="border border-gray-200 rounded-lg p-4 flex gap-3 hover:bg-gray-50 transition">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                            style={{
                              backgroundColor: activity.iconBg,
                              color: activity.iconColor
                            }}
                          >
                            {activity.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 text-sm font-medium">{activity.title}</p>
                            {activity.description && (
                              <p className="text-gray-600 text-xs mt-1">{activity.description}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium mt-4" style={{ backgroundColor: '#e3ebff', color: '#3d5afe' }}>
                    📅 Upcoming Activity
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                        style={{
                          backgroundColor: projectData.upcomingActivity.iconBg,
                          color: projectData.upcomingActivity.iconColor
                        }}
                      >
                        {projectData.upcomingActivity.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 text-sm font-semibold">{projectData.upcomingActivity.title}</h4>
                        <p className="text-gray-600 text-xs mt-1">{projectData.upcomingActivity.description}</p>
                        <p className="text-gray-500 text-xs mt-1">{projectData.upcomingActivity.timestamp}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Reminder <span className="text-red-500">*</span></label>
                        <select className="w-full border border-gray-300 rounded-md h-9 px-2.5 text-xs text-gray-700">
                          <option>{projectData.upcomingActivity.reminder}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Task Priority <span className="text-red-500">*</span></label>
                        <select className="w-full border border-gray-300 rounded-md h-9 px-2.5 text-xs text-gray-700">
                          <option>{projectData.upcomingActivity.priority}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Assigned To <span className="text-red-500">*</span></label>
                        <select className="w-full border border-gray-300 rounded-md h-9 px-2.5 text-xs text-gray-700">
                          <option>{projectData.upcomingActivity.assignedTo}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notes yet</p>
                </div>
              )}

              {activeTab === 'calls' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No calls recorded</p>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No files attached</p>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No emails</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;

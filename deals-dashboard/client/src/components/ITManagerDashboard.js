import React, { useState, useEffect } from 'react';
import { 
  Calendar, Activity, Users, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { itManagerAPI, teamsAPI } from '../services/api';
import { showErrorToast } from '../utils/toast';

const ITManagerDashboard = () => {
  const [projectsSummary, setProjectsSummary] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching IT Manager Dashboard data...');
      const [summaryData, perfData, taskData] = await Promise.all([
        itManagerAPI.getProjectsSummary(),
        itManagerAPI.getPerformance(),
        itManagerAPI.getTeamTasks()
      ]);
      console.log('IT Dashboard Data received:', { summaryData, perfData, taskData });
      setProjectsSummary(summaryData || []);
      setPerformance(perfData || []);
      setTeamTasks(taskData || []);
    } catch (error) {
      console.error('Failed to fetch IT manager dashboard data:', error);
      showErrorToast('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-xl ">IT Project Tracking</h1>
          <p className="text-gray-500 text-xs">Comprehensive overview of all IT projects and their delivery status</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg  text-gray-900">Project Delivery Milestones</h3>
            <p className="text-xs text-gray-500">Real-time status of assigned tasks and deadlines</p>
          </div>
          <Activity size={18} className="text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-3 text-xs  text-gray-400 uppercase">Project & Team</th>
                <th className="p-3 text-xs  text-gray-400 uppercase">Updates</th>
                <th className="p-3 text-xs  text-gray-400 uppercase">Deadline</th>
                <th className="p-3 text-xs  text-gray-400 uppercase">Tentative</th>
                <th className="p-3 text-xs  text-gray-400 uppercase">Reports</th>
                <th className="p-3 text-xs  text-gray-400 uppercase">Tasks</th>
                <th className="p-3 text-xs  text-gray-400 uppercase">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projectsSummary.length > 0 ? projectsSummary.map(p => {
                const isOverdue = p.project_deadline && new Date(p.project_deadline) < new Date() && p.project_status !== 'Completed';
                const completionPercentage = p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0;
                
                const lastWeekly = p.last_weekly_report ? new Date(p.last_weekly_report) : null;
                const lastMonthly = p.last_monthly_report ? new Date(p.last_monthly_report) : null;
                const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
                const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
                
                const isWeeklyOverdue = !lastWeekly || lastWeekly < weekAgo;
                const isMonthlyOverdue = !lastMonthly || lastMonthly < monthAgo;
                
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">
                      <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                      <p className="text-[10px] text-red-600 font-medium uppercase">{p.assigned_team || 'Unassigned'}</p>
                    </td>
                    <td className="p-3 max-w-[200px]">
                      <p className="text-[10px] text-gray-600 truncate" title={p.last_update}>{p.last_update || 'No recent updates'}</p>
                    </td>
                    <td className="p-3 text-xs text-gray-600">
                      {p.project_deadline ? new Date(p.project_deadline).toLocaleDateString() : 'No Deadline'}
                    </td>
                    <td className="p-3 text-xs text-gray-600">
                      {p.tentative_completion_date ? new Date(p.tentative_completion_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${isWeeklyOverdue ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          W: {lastWeekly ? lastWeekly.toLocaleDateString() : 'Pending'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${isMonthlyOverdue ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          M: {lastMonthly ? lastMonthly.toLocaleDateString() : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium">
                          <span className="text-gray-500" title="Completed/Total (Remaining)">
                            {p.completed_tasks || 0}/{p.total_tasks || 0} ({p.remaining_tasks || 0})
                          </span>
                          <span className="text-red-600">{completionPercentage}%</span>
                        </div>
                        <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${completionPercentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className={`w-2 h-2 rounded-full mx-auto ${
                        p.project_status === 'Completed' ? 'bg-green-500' :
                        isOverdue ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                      }`} />
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500 text-sm">No active IT projects</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ITManagerDashboard;

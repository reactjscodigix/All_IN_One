import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  User,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  ChevronRight,
  Layout
} from 'lucide-react';
import AdvancedDataTable from './AdvancedDataTable';
import AdvancedFilterDropdown from './AdvancedFilterDropdown';
import AdvancedDateRangePicker from './AdvancedDateRangePicker';
import SortByDropdown from './SortByDropdown';
import ManageColumnsDropdown from './ManageColumnsDropdown';
import leadsData from '../data/crmLeadsData.json';

import { leadsAPI, companiesAPI } from '../services/api';

const LeadDistributionPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortBy, setSortBy] = useState('newest');
  const [visibleColumns, setVisibleColumns] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const leadsRes = await leadsAPI.getAll();
      
      let baseLeads = [];
      if (leadsRes && Array.isArray(leadsRes) && leadsRes.length > 0) {
        baseLeads = leadsRes;
      } else {
        baseLeads = leadsData.leads || [];
      }

      // Augment leads data with distribution-specific fields
      const augmentedLeads = baseLeads.map(lead => {
        const createdAt = lead.created_at || '2024-01-01';
        const createdDate = new Date(createdAt);
        const today = new Date();
        const ageInDays = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));

        const assignmentTypes = ['Manual', 'Round Robin', 'Auto'];
        const priorities = ['Low', 'Medium', 'High'];
        const serviceTypes = ['Dev', 'Marketing'];
        const followUpStatuses = ['Scheduled', 'Completed', 'Overdue'];

        return {
          ...lead,
          id: lead.id,
          name: lead.lead_name || lead.name || 'Unknown',
          reference: `LD-${lead.id.toString().padStart(4, '0')}`,
          service_type: lead.industry === 'Software' ? 'Dev' : (serviceTypes[lead.id % serviceTypes.length]),
          priority: priorities[lead.id % priorities.length],
          assignment_type: assignmentTypes[lead.id % assignmentTypes.length],
          assigned_date: lead.created_at || '2024-01-15',
          last_activity: lead.last_contact_date || '2024-02-10',
          next_followup: lead.follow_up_date || '2024-03-05',
          followup_status: followUpStatuses[lead.id % followUpStatuses.length],
          lead_age: ageInDays > 0 ? ageInDays : (lead.id * 3 + 5),
          status: lead.lead_status || lead.status || 'New'
        };
      });
      setLeads(augmentedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      // Fallback to mock data on error
      const augmentedLeads = (leadsData.leads || []).map(lead => {
        return {
          ...lead,
          reference: `LD-${lead.id.toString().padStart(4, '0')}`,
          service_type: 'Dev',
          priority: 'Medium',
          assignment_type: 'Manual',
          assigned_date: '2024-01-15',
          last_activity: '2024-02-10',
          next_followup: '2024-03-05',
          followup_status: 'Scheduled',
          lead_age: 5,
          status: lead.status || 'New'
        };
      });
      setLeads(augmentedLeads);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const columns = [
    {
      key: 'id',
      label: 'Lead ID & Ref',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
          <Link 
            to={`/lead/${row.id}`}
            className="group flex flex-col"
          >
            <span className="text-[10px] text-gray-400  leading-tight group-hover:text-red transition-colors">#{value}</span>
            <div className="text-red text-[11px] hover:underline flex items-center gap-1  leading-tight">
              {row.reference}
              <ExternalLink size={10} />
            </div>
          </Link>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Lead Name',
      sortable: true,
      render: (value) => <span className="text-xs text-gray-900 ">{value}</span>
    },
    {
      key: 'service_type',
      label: 'Service Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs  ${
          value === 'Dev' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => {
        const colors = {
          High: 'text-red-600 bg-red-50',
          Medium: 'text-orange-600 bg-orange-50',
          Low: 'text-green-600 bg-green-50'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-[11px]  ${colors[value] || 'bg-gray-50'}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'owner_name',
      label: 'Assigned To',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px]  text-gray-600">
            {value ? value.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <span className="text-xs text-gray-700 ">{value || 'Unassigned'}</span>
        </div>
      )
    },
    {
      key: 'assignment_type',
      label: 'Assignment Type',
      sortable: true,
      render: (value) => {
        const colors = {
          Manual: 'bg-gray-100 text-gray-700',
          'Round Robin': 'bg-indigo-50 text-indigo-700',
          Auto: 'bg-teal-50 text-teal-700'
        };
        return (
          <span className={`px-2 py-1 rounded text-[11px]  ${colors[value] || 'bg-gray-100'}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'assigned_date',
      label: 'Assigned Date',
      sortable: true,
      render: (value) => <span className="text-xs text-gray-500">{formatDate(value)}</span>
    },
    {
      key: 'last_activity',
      label: 'Last Activity',
      sortable: true,
      render: (value) => <span className="text-xs text-gray-500">{formatDate(value)}</span>
    },
    {
      key: 'next_followup',
      label: 'Next Follow-Up',
      sortable: true,
      render: (value) => <span className="text-xs text-gray-500  text-red-500">{formatDate(value)}</span>
    },
    {
      key: 'followup_status',
      label: 'Follow-Up Status',
      sortable: true,
      render: (value) => {
        const colors = {
          Completed: 'bg-green-100 text-green-700',
          Scheduled: 'bg-blue-100 text-blue-700',
          Overdue: 'bg-red-100 text-red-700'
        };
        return (
          <span className={`px-2 py-1 rounded text-[11px]   ${colors[value] || 'bg-gray-100'}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'lead_age',
      label: 'Lead Age (Days)',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-gray-700 ">
          <span className="text-xs">{value}</span>
          <span className="text-[10px] text-gray-400">days</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const getStatusColor = (status) => {
          switch (status?.toLowerCase()) {
            case 'new': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'contacted': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'qualified': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'converted to deal': return 'bg-green-50 text-green-700 border-green-100';
            case 'lost': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
          }
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px]  border ${getStatusColor(value)}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'action',
      label: 'Action',
      render: (_, row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Handle reassign logic
          }}
          className="p-1.5 text-gray-400 hover:text-red transition-colors rounded-md hover:bg-red-50"
        >
          <RefreshCw size={14} />
        </button>
      )
    }
  ];

  useEffect(() => {
    setVisibleColumns(columns.map(c => c.key));
  }, []);

  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'New', value: 'New' },
        { label: 'Contacted', value: 'Contacted' },
        { label: 'Qualified', value: 'Qualified' },
        { label: 'Lost', value: 'Lost' },
      ]
    },
    {
      key: 'service_type',
      label: 'Service Type',
      options: [
        { label: 'Dev', value: 'Dev' },
        { label: 'Marketing', value: 'Marketing' }
      ]
    },
    {
      key: 'assignment_type',
      label: 'Assignment Type',
      options: [
        { label: 'Manual', value: 'Manual' },
        { label: 'Round Robin', value: 'Round Robin' },
        { label: 'Auto', value: 'Auto' }
      ]
    }
  ];

  const handleResetFilters = () => {
    setSelectedFilters({});
    setDateRange({ start: null, end: null });
    setSearchTerm('');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading lead distribution...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-[500] text-gray-900">Lead Distribution</h1>
            <span className="bg-red-100 text-red  text-[12px]  text-black px-2 py-1 rounded-full">
              {leads.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 ">
            <span>Home</span>
            <ChevronRight size={14} />
            <span className="text-gray-900">Lead Distribution</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs  text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            Export
            <ChevronDown size={14} />
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
            <RotateCcw size={16} />
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded text-gray-400 hover:text-gray-600 transition-colors shadow-sm">
            <Layout size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 pt-0">
        {/* Row 1: Search and Action Button */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded text-xs focus:outline-none focus:border-red transition-colors shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {/* logic to run auto distribution */}}
              className="flex items-center gap-2 px-4 py-2 bg-red text-white rounded text-xs  hover:bg-red/90 transition-colors shadow-sm"
            >
              <RefreshCw size={15} />
              Run Auto-Distribution
            </button>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <SortByDropdown
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
            <AdvancedDateRangePicker
              dateRange={dateRange}
              onChange={setDateRange}
            />
            <AdvancedFilterDropdown
              filterConfigs={filterConfigs}
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
            />
            <ManageColumnsDropdown
              columns={columns}
              visibleColumns={visibleColumns}
              onChange={setVisibleColumns}
            />
            <button
              onClick={handleResetFilters}
              className="p-2 text-gray-400 hover:text-red transition-colors rounded-lg hover:bg-red-50"
              title="Reset Filters"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <AdvancedDataTable
            columns={columns}
            data={leads}
            hideInternalHeader={true}
            externalSearchTerm={searchTerm}
            externalFilters={selectedFilters}
            externalDateRange={dateRange}
            externalSortBy={sortBy}
            externalVisibleColumns={visibleColumns}
            searchKeys={['name', 'reference', 'id']}
            onRowClick={(row) => navigate(`/lead/${row.id}`)}
          />
        </div>
      </div>
    </div>
  );
};

export default LeadDistributionPage;
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { contactsAPI, dealsAPI, leadsAPI, companiesAPI, campaignAPI } from '../services/api';

const AnalyticsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [contactsRes, dealsRes, leadsRes, companiesRes, campaignsRes] = await Promise.all([
        contactsAPI.getAll().catch(() => []),
        dealsAPI.getAll().catch(() => []),
        leadsAPI.getAll().catch(() => []),
        companiesAPI.getAll().catch(() => []),
        campaignAPI.getAll().catch(() => []),
      ]);

      setContacts(Array.isArray(contactsRes) ? contactsRes : []);
      setDeals(Array.isArray(dealsRes) ? dealsRes : []);
      setLeads(Array.isArray(leadsRes) ? leadsRes : []);
      setCompanies(Array.isArray(companiesRes) ? companiesRes : []);
      setCampaigns(Array.isArray(campaignsRes) ? campaignsRes : []);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setContacts([]);
      setDeals([]);
      setLeads([]);
      setCompanies([]);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = '') => {
    const parts = name.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (name[0] || 'U').toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[index % colors.length];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const Card = ({ title, children, right }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-gray-800">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );

  const SmallSelect = () => (
    <select className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none">
      <option>Last 30 Days</option>
    </select>
  );

  const DoubleSelect = () => (
    <div className="flex items-center gap-2">
      <select className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none">
        <option>Sales Pipeline</option>
        <option>Marketing Pipeline</option>
      </select>
      <select className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none">
        <option>Last 30 Days</option>
      </select>
    </div>
  );

  const recentContactsData = contacts.slice(0, 5).map((c, idx) => {
    const fullName = c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : c.first_name || 'Unknown';
    return {
      id: c.id,
      name: fullName,
      role: c.position || 'N/A',
      phone: c.phone || c.email || '-',
      date: formatDate(c.created_at),
      initials: getInitials(fullName),
      bg: getAvatarColor(idx),
    };
  });

  const dealsByStageData = deals.reduce((acc, deal) => {
    const stage = deal.stage || 'Unknown';
    const existing = acc.find(d => d.stage === stage);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ stage, value: 1 });
    }
    return acc;
  }, []);

  const wonDealsData = deals
    .filter(d => d.status === 'Won')
    .reduce((acc, deal) => {
      const stage = deal.stage || 'Unknown';
      const existing = acc.find(d => d.name === stage);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: stage, value: 1 });
      }
      return acc;
    }, [])
    .slice(0, 3);

  const recentDealsData = deals.slice(0, 5).map(d => ({
    name: d.deal_name || 'Unnamed Deal',
    stage: d.stage || 'Unknown',
    value: `$${(d.deal_value || 0).toLocaleString()}`,
    prob: `${d.probability || 0}%`,
    status: d.status || 'Open',
  }));

  const lostLeadsData = leads
    .filter(l => l.status === 'Lost')
    .reduce((acc, lead) => {
      const stage = lead.stage || 'Unknown';
      const existing = acc.find(d => d.name === stage);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: stage, value: 1 });
      }
      return acc;
    }, [])
    .slice(0, 3);

  const leadsByStageData = leads.reduce((acc, lead) => {
    const stage = lead.stage || 'Unknown';
    const existing = acc.find(d => d.stage === stage);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ stage, value: 1 });
    }
    return acc;
  }, []);

  const recentLeadsData = leads.slice(0, 5).map(l => ({
    name: l.name || 'Unknown',
    company: l.company || 'N/A',
    phone: l.phone || l.email || '-',
    status: l.status || 'Contacted',
  }));

  const recentCompaniesData = companies.slice(0, 6).map(c => ({
    name: c.company_name || 'Unknown',
    phone: c.phone || c.email || '-',
    date: formatDate(c.created_at),
  }));

  const recentCampaignsData = campaigns.slice(0, 4).map(c => ({
    title: c.name || 'Untitled Campaign',
    type: c.type || 'Marketing',
    status: c.status || 'Pending',
    due: formatDate(c.created_at),
    stats: {
      opened: '0%',
      closed: '0%',
      unsub: '0%',
      delivered: '0%',
      conv: '0%',
    },
  }));

  const HProgress = ({ label, value, max = 500, color = '#28C76F' }) => {
    const pct = Math.min(100, (value / max) * 100);
    return (
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[13px] text-gray-600">{label}</div>
          <div className="text-[13px] text-gray-700 font-medium">{value}</div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
          <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN (col-span-2) */}
          <div className="col-span-2 space-y-6">
            {/* Recently Created Contacts */}
            <Card title="Recently Created Contacts" right={<SmallSelect />}>
              <div className="border border-gray-200 rounded">
                <div className="grid grid-cols-3 gap-0 text-[13px] text-gray-500 border-b border-gray-200 bg-gray-50 p-3">
                  <div>Contact</div>
                  <div>Phone</div>
                  <div>Created At</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {recentContactsData.length > 0 ? (
                    recentContactsData.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${c.bg} rounded-full flex items-center justify-center text-white text-[14px] font-bold`}>{c.initials}</div>
                          <div>
                            <div className="text-[13px] font-medium text-gray-800">{c.name}</div>
                            <div className="text-xs text-gray-400">{c.role}</div>
                          </div>
                        </div>
                        <div className="text-[13px] text-gray-500">{c.phone}</div>
                        <div className="text-[13px] text-gray-400">{c.date}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">No contacts found</div>
                  )}
                </div>
              </div>
            </Card>

            {/* Won Deals Stage */}
            <Card title="Won Deals Stage" right={<DoubleSelect />}>
              <div className="p-0">
                {wonDealsData.length > 0 ? (
                  wonDealsData.map((d, i) => (
                    <HProgress key={i} label={d.name} value={d.value} max={Math.max(10, Math.max(...wonDealsData.map(x => x.value)))} color="#28C76F" />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No won deals data</div>
                )}
              </div>
            </Card>

            {/* Recently Created Deals */}
            <Card title="Recently Created Deals" right={<SmallSelect />}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-[13px]">
                  <thead>
                    <tr className="text-[13px] text-gray-500 border-b border-gray-200">
                      <th className="text-left py-2">Deal Name</th>
                      <th className="text-left py-2">Stage</th>
                      <th className="text-left py-2">Deal Value</th>
                      <th className="text-left py-2">Probability</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentDealsData.length > 0 ? (
                      recentDealsData.map((r, i) => (
                        <tr key={i} className="bg-white">
                          <td className="py-2 text-gray-800">{r.name}</td>
                          <td className="py-2 text-gray-500">{r.stage}</td>
                          <td className="py-2 text-gray-500">{r.value}</td>
                          <td className="py-2 text-gray-500">{r.prob}</td>
                          <td className="py-2">
                            <span className={`inline-block px-2 py-[2px] text-[12px] rounded-md ${r.status === 'Lost' ? 'bg-red-100 text-red-600' : r.status === 'Open' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-500">No deals found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Lost Leads Stage */}
            <Card title="Lost Leads Stage" right={<DoubleSelect />}>
              <div className="p-0">
                {lostLeadsData.length > 0 ? (
                  lostLeadsData.map((d, i) => (
                    <HProgress key={i} label={d.name} value={d.value} max={Math.max(10, Math.max(...lostLeadsData.map(x => x.value)))} color="#EA5455" />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No lost leads data</div>
                )}
              </div>
            </Card>

            {/* Leads By Stage */}
            <Card title="Leads By Stage" right={<DoubleSelect />}>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsByStageData.length > 0 ? leadsByStageData : [{ stage: 'No Data', value: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0E7EFA" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Recently Added Companies */}
            <Card title="Recently Added Companies" right={<SmallSelect />}>
              <div className="border border-gray-200 rounded">
                <div className="grid grid-cols-3 gap-0 text-[13px] text-gray-500 border-b border-gray-200 bg-gray-50 p-3">
                  <div>Company Name</div>
                  <div>Phone</div>
                  <div>Created at</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {recentCompaniesData.length > 0 ? (
                    recentCompaniesData.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getAvatarColor(i)}`}></div>
                          <div className="text-[13px]">{c.name}</div>
                        </div>
                        <div className="text-[13px] text-gray-500">{c.phone}</div>
                        <div className="text-[13px] text-gray-400">{c.date}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">No companies found</div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (col-span-1) */}
          <div className="col-span-1 space-y-6">
            {/* Deals By Stage */}
            <Card title="Deals By Stage" right={<DoubleSelect />}>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dealsByStageData.length > 0 ? dealsByStageData : [{ stage: 'No Data', value: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0E7EFA" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Activities - Empty for now as no activities API */}
            <Card title="Activities" right={<SmallSelect />}>
              <div className="space-y-2 text-center text-gray-500 py-4">
                <p>No activities data available</p>
              </div>
            </Card>

            {/* Lost Leads Stage (small) */}
            <Card title="Lost Leads Stage" right={<DoubleSelect />}>
              <div className="p-0">
                {lostLeadsData.length > 0 ? (
                  lostLeadsData.map((d, i) => (
                    <HProgress key={i} label={d.name} value={d.value} max={Math.max(10, Math.max(...lostLeadsData.map(x => x.value)))} color="#EA5455" />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No lost leads data</div>
                )}
              </div>
            </Card>

            {/* Recently Created Leads */}
            <Card title="Recently Created Leads" right={<SmallSelect />}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-[13px]">
                  <thead>
                    <tr className="text-[13px] text-gray-500 border-b border-gray-200">
                      <th className="text-left py-2">Lead Name</th>
                      <th className="text-left py-2">Company</th>
                      <th className="text-left py-2">Phone</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentLeadsData.length > 0 ? (
                      recentLeadsData.map((r, i) => (
                        <tr key={i} className="bg-white">
                          <td className="py-2 text-gray-800">{r.name}</td>
                          <td className="py-2 text-gray-500">{r.company}</td>
                          <td className="py-2 text-gray-500">{r.phone}</td>
                          <td className="py-2">
                            <span className={`inline-block px-2 py-[2px] text-[12px] rounded-md ${r.status === 'Closed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-gray-500">No leads found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recently Created Campaign */}
            <Card title="Recently Created Campaign" right={<SmallSelect />}>
              <div className="space-y-3">
                {recentCampaignsData.length > 0 ? (
                  recentCampaignsData.map((c, i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-[13px] font-medium">{c.title}</div>
                          <div className="text-xs text-gray-400">{c.type}</div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-[2px] rounded-md text-[12px] font-semibold ${c.status === 'Running' ? 'bg-green-100 text-green-700' : c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                      </div>

                      <div className="mt-2">
                        <div className="text-[11px] text-gray-400">Created: {c.due}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No campaigns found</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

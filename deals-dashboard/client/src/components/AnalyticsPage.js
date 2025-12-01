import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsPage = () => {
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

  const contacts = [
    { id: 1, name: 'Elizabeth Morgan', role: 'Product Manager', phone: '+1 87545 54503', date: '10 May 2025', initials: 'EM', bg: 'bg-red-500' },
    { id: 2, name: 'Katherine Brooks', role: 'Installer', phone: '+1 98975 17485', date: '02 May 2025', initials: 'KB', bg: 'bg-amber-500' },
    { id: 3, name: 'Samantha Reed', role: 'Human Resources', phone: '+1 54655 25455', date: '28 Apr 2025', initials: 'SR', bg: 'bg-amber-500' },
    { id: 4, name: 'William Anderson', role: 'Data Analytics', phone: '+1 45447 58787', date: '16 Apr 2025', initials: 'WA', bg: 'bg-blue-500' },
    { id: 5, name: 'Jonathan Mitchell', role: 'Facility Manager', phone: '+1 12354 27545', date: '05 Apr 2025', initials: 'JM', bg: 'bg-gray-500' },
  ];

  const dealsByStage = [
    { stage: 'Inpipeline', value: 400 },
    { stage: 'Follow Up', value: 120 },
    { stage: 'Schedule', value: 248 },
    { stage: 'Conversation', value: 470 },
    { stage: 'Won', value: 470 },
    { stage: 'Lost', value: 180 },
  ];

  const wonDeals = [
    { name: 'Conversation', value: 350 },
    { name: 'Follow Up', value: 140 },
    { name: 'Inpipeline', value: 260 },
  ];

  const recentDeals = [
    { name: 'Collins', stage: 'Conversation', value: '$04,51,000', prob: '85%', status: 'Open' },
    { name: 'Konopelski', stage: 'Pipeline', value: '$04,14,800', prob: '15%', status: 'Lost' },
    { name: 'Adams', stage: 'Won', value: '$04,14,800', prob: '95%', status: 'Won' },
    { name: 'Schumm', stage: 'Lost', value: '$9,14,400', prob: '47%', status: 'Won' },
    { name: 'Wisozk', stage: 'Follow Up', value: '$11,14,400', prob: '98%', status: 'Won' },
  ];

  const lostLeads = [
    { name: 'Conversation', value: 380 },
    { name: 'Follow Up', value: 200 },
    { name: 'Inpipeline', value: 420 },
  ];

  const activities = [
    { id: 1, title: 'We scheduled a meeting', date: '25 sep 2025, 12:12 PM', person: 'Elizabeth Morgan', role: 'Product Manager', tag: 'Meeting', bg: 'bg-red-500' },
    { id: 2, title: 'We scheduled a meeting', date: '28 sep 2025, 12:12 PM', person: 'Katherine Brooks', role: 'Installer', tag: 'Email', bg: 'bg-yellow-500' },
    { id: 3, title: 'We scheduled a meeting', date: '25 jun 2025, 12:12 PM', person: 'Samantha Reed', role: 'Human Resources', tag: 'Task', bg: 'bg-amber-500' },
    { id: 4, title: 'We scheduled a meeting', date: '20 sep 2025, 12:00 PM', person: 'William Anderson', role: 'Data Analytics', tag: 'Calls', bg: 'bg-blue-500' },
  ];

  const recentLeads = [
    { name: 'Collins', company: 'NovaWave LLC', phone: '+1 87545 54503', status: 'Closed', icon: '🟢' },
    { name: 'Konopelski', company: 'BlueSky', phone: '+1 98975 17485', status: 'Contacted', icon: '🟠' },
    { name: 'Adams', company: 'Silver Hawk', phone: '+1 54655 25455', status: 'Closed', icon: '🟢' },
    { name: 'Schumm', company: 'Summit Peak', phone: '+1 45447 58787', status: 'Contacted', icon: '🔵' },
    { name: 'Wisozk', company: 'RiverStone Ltd', phone: '+1 12354 27545', status: 'Closed', icon: '⬛' },
  ];

  const leadsByStage = [
    { stage: 'Inspection', value: 300 },
    { stage: 'Follow-up', value: 70 },
    { stage: 'Schedule', value: 250 },
    { stage: 'Conversation', value: 370 },
    { stage: 'Won', value: 470 },
    { stage: 'Lost', value: 200 },
  ];

  const companies = [
    { name: 'NovaWave LLC', phone: '+1 87545 54503', date: '10 May 2025', icon: '🔵' },
    { name: 'BlueSky Industries', phone: '+1 98975 17485', date: '02 May 2025', icon: '🟠' },
    { name: 'Silver Hawk', phone: '+1 54655 25455', date: '28 Apr 2025', icon: '🟢' },
    { name: 'Summit Peak', phone: '+1 45447 58787', date: '16 Apr 2025', icon: '🔵' },
    { name: 'RiverStone Ltd', phone: '+1 12354 27545', date: '05 Apr 2025', icon: '⬛' },
    { name: 'Redwood Inc', phone: '+1 46789 27455', date: '15 Nov 2025', icon: '⭐' },
  ];

  const campaigns = [
    { title: 'Distribution', type: 'Public Relations', stats: { opened: '40.5%', closed: '20.5%', unsub: '30.5%', delivered: '70.5%', conv: '35.0%' }, status: 'Bounced', due: '25 Sep 2025' },
    { title: 'Pricing', type: 'Social Marketing', stats: { opened: '70.5%', closed: '90.5%', unsub: '20.5%', delivered: '90.5%', conv: '98.0%' }, status: 'Running', due: '28 Sep 2025' },
    { title: 'Merchandising', type: 'Content Marketing', stats: { opened: '30.5%', closed: '10.5%', unsub: '70.5%', delivered: '90.5%', conv: '45.0%' }, status: 'Paused', due: '14 Sep 2025' },
    { title: 'Repeat Customer', type: 'Rebranding', stats: { opened: '80.5%', closed: '20.5%', unsub: '70.5%', delivered: '60.5%', conv: '75.0%' }, status: 'Bounced', due: '25 Sep 2023' },
  ];

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
                  {contacts.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${c.bg} rounded-full flex items-center justify-center text-white text-[14px] font-bold`}>{c.initials.charAt(0)}</div>
                        <div>
                          <div className="text-[13px] font-medium text-gray-800">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.role}</div>
                        </div>
                      </div>
                      <div className="text-[13px] text-gray-500">{c.phone}</div>
                      <div className="text-[13px] text-gray-400">{c.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Won Deals Stage */}
            <Card title="Won Deals Stage" right={<DoubleSelect />}>
              <div className="p-0">
                {wonDeals.map((d, i) => (
                  <HProgress key={i} label={d.name} value={d.value} max={400} color="#28C76F" />
                ))}
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
                    {recentDeals.map((r, i) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Lost Leads Stage */}
            <Card title="Lost Leads Stage" right={<DoubleSelect />}>
              <div className="p-0">
                {lostLeads.map((d, i) => (
                  <HProgress key={i} label={d.name} value={d.value} max={500} color="#EA5455" />
                ))}
              </div>
            </Card>

            {/* Leads By Stage */}
            <Card title="Leads By Stage" right={<DoubleSelect />}>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsByStage}>
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
                  {companies.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">{c.icon}</div>
                        <div className="text-[13px]">{c.name}</div>
                      </div>
                      <div className="text-[13px] text-gray-500">{c.phone}</div>
                      <div className="text-[13px] text-gray-400">{c.date}</div>
                    </div>
                  ))}
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
                  <BarChart data={dealsByStage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0E7EFA" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Activities */}
            <Card title="Activities" right={<SmallSelect />}>
              <div className="space-y-2">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded p-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="text-[11px] px-2 py-1 rounded bg-white border text-blue-600 font-semibold whitespace-nowrap">{a.tag}</div>
                      <div>
                        <div className="text-[13px] font-medium">{a.title}</div>
                        <div className="text-xs text-gray-400">{a.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Lost Leads Stage (small) */}
            <Card title="Lost Leads Stage" right={<DoubleSelect />}>
              <div className="p-0">
                {lostLeads.map((d, i) => (
                  <HProgress key={i} label={d.name} value={d.value} max={500} color="#EA5455" />
                ))}
              </div>
            </Card>

            {/* Recently Created Leads */}
            <Card title="Recently Created Leads" right={<SmallSelect />}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-[13px]">
                  <thead>
                    <tr className="text-[13px] text-gray-500 border-b border-gray-200">
                      <th className="text-left py-2">Lead Name</th>
                      <th className="text-left py-2">Company Name</th>
                      <th className="text-left py-2">Phone</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentLeads.map((r, i) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recently Created Campaign */}
            <Card title="Recently Created Campaign" right={<SmallSelect />}>
              <div className="space-y-3">
                {campaigns.map((c, i) => (
                  <div key={i} className="bg-gray-50 p-2 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-[13px] font-medium">{c.title}</div>
                        <div className="text-xs text-gray-400">{c.type}</div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-[2px] rounded-md text-[12px] font-semibold ${c.status === 'Running' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="text-[11px]">
                        <div className="flex justify-between"><span>Opened</span><span className="font-semibold">{c.stats.opened}</span></div>
                        <div className="flex justify-between"><span>Closed</span><span className="font-semibold">{c.stats.closed}</span></div>
                        <div className="flex justify-between"><span>Unsub</span><span className="font-semibold">{c.stats.unsub}</span></div>
                        <div className="flex justify-between"><span>Delivered</span><span className="font-semibold">{c.stats.delivered}</span></div>
                        <div className="flex justify-between"><span>Conv</span><span className="font-semibold">{c.stats.conv}</span></div>
                      </div>

                      <div>
                        <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
                          <div className="bg-teal-500 h-full" style={{ width: c.stats.opened }} />
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">Due: {c.due}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

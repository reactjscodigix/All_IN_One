import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Users, Target, TrendingUp, DollarSign, Percent,
  Mail, Share2, ArrowUpRight,
  MoreHorizontal, ChevronDown, Calendar, Eye, MousePointer,
  FileText, Download, Bell, Phone,
  Megaphone, BarChart2, ChevronRight, Send
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LEAD_GROWTH_DATA = [
  { date: '20 May', total: 980,  qualified: 620, converted: 380 },
  { date: '21 May', total: 1050, qualified: 680, converted: 410 },
  { date: '22 May', total: 1100, qualified: 710, converted: 440 },
  { date: '23 May', total: 1160, qualified: 740, converted: 470 },
  { date: '24 May', total: 1200, qualified: 790, converted: 505 },
  { date: '25 May', total: 1230, qualified: 820, converted: 520 },
  { date: '26 May', total: 1248, qualified: 842, converted: 540 },
];

const LEADS_BY_SOURCE = [
  { name: 'Website',        value: 437, pct: 35, color: '#4F46E5' },
  { name: 'Social Media',   value: 312, pct: 25, color: '#F59E0B' },
  { name: 'Email Campaign', value: 187, pct: 16, color: '#10B981' },
  { name: 'Referral',       value: 125, pct: 10, color: '#EF4444' },
  { name: 'Paid Ads',       value: 99,  pct: 8,  color: '#8B5CF6' },
  { name: 'Others',         value: 88,  pct: 7,  color: '#6B7280' },
];

const PERFORMANCE_TREND = [
  { month: 'Jan 2026', leads: 920,  conversions: 82,  revenue: 32000 },
  { month: 'Feb 2026', leads: 1050, conversions: 96,  revenue: 38000 },
  { month: 'Mar 2026', leads: 1120, conversions: 103, revenue: 43000 },
  { month: 'Apr 2026', leads: 980,  conversions: 88,  revenue: 36000 },
  { month: 'May 2026', leads: 1248, conversions: 126, revenue: 48920 },
  { month: 'Jun 2026', leads: 1380, conversions: 148, revenue: 58000 },
];

const TOP_CAMPAIGNS = [
  { name: 'Summer Sale Campaign', type: 'Email Campaign',  Icon: Mail,      leads: 324, convRate: 12.6, color: '#4F46E5' },
  { name: 'Product Webinar',      type: 'Webinar',         Icon: Bell,      leads: 276, convRate: 18.3, color: '#F59E0B' },
  { name: 'Social Media Boost',   type: 'Social Campaign', Icon: Share2,    leads: 215, convRate: 9.8,  color: '#10B981' },
  { name: 'New Product Launch',   type: 'Email Campaign',  Icon: Megaphone, leads: 198, convRate: 14.7, color: '#EF4444' },
  { name: 'Q2 Newsletter',        type: 'Newsletter',      Icon: Mail,      leads: 185, convRate: 11.2, color: '#8B5CF6' },
];

const RECENT_LEADS = [
  { name: 'Robert Fox',         role: 'Marketing Manager, Acme Corp.', badge: 'Qualified', badgeColor: '#10B981', time: '2m ago',  avatar: 'RF', avatarBg: '#EDE9FE' },
  { name: 'Cameron Williamson', role: 'Product Head, TechNova',        badge: 'New',       badgeColor: '#4F46E5', time: '15m ago', avatar: 'CW', avatarBg: '#FEF3C7' },
  { name: 'Dianne Russell',     role: 'CEO, Innovate Labs',            badge: 'Qualified', badgeColor: '#10B981', time: '1h ago',  avatar: 'DR', avatarBg: '#DBEAFE' },
  { name: 'Savannah Nguyen',    role: 'Founder, Bright Solutions',     badge: 'Contacted', badgeColor: '#F59E0B', time: '2h ago',  avatar: 'SN', avatarBg: '#FCE7F3' },
  { name: 'Marvin McKinney',    role: 'CTO, NextGen Systems',          badge: 'New',       badgeColor: '#4F46E5', time: '3h ago',  avatar: 'MM', avatarBg: '#D1FAE5' },
];

const FUNNEL_DATA = [
  { label: 'New',           value: 1248, color: '#4F46E5', width: 100 },
  { label: 'Contacted',     value: 842,  color: '#818CF8', width: 80  },
  { label: 'Qualified',     value: 468,  color: '#F59E0B', width: 60  },
  { label: 'Proposal Sent', value: 235,  color: '#10B981', width: 44  },
  { label: 'Won',           value: 128,  color: '#22C55E', width: 30  },
];

const ENGAGEMENT = [
  { label: 'Email Opens',        value: 2481, change: 15, Icon: Mail,         color: '#4F46E5' },
  { label: 'Email Clicks',       value: 1256, change: 18, Icon: MousePointer, color: '#10B981' },
  { label: 'Landing Page Views', value: 3645, change: 22, Icon: Eye,          color: '#F59E0B' },
  { label: 'Form Submissions',   value: 842,  change: 17, Icon: FileText,     color: '#8B5CF6' },
  { label: 'Content Downloads',  value: 612,  change: 13, Icon: Download,     color: '#EF4444' },
];

const ACTIVITIES_DATA = [
  { title: 'Campaign Review Meeting', sub: 'Today, 11:00 AM',       Icon: Users,    color: '#4F46E5', bg: '#EDE9FE' },
  { title: 'Email Campaign Launch',   sub: 'Tomorrow, 09:30 AM',    Icon: Send,     color: '#10B981', bg: '#D1FAE5' },
  { title: 'Content Strategy Call',   sub: '22 May 2026, 02:00 PM', Icon: Phone,    color: '#F59E0B', bg: '#FEF3C7' },
  { title: 'Performance Review',      sub: '23 May 2026, 10:00 AM', Icon: BarChart2,color: '#EF4444', bg: '#FEE2E2' },
];

const TASKS_DATA = [
  { label: 'Review new landing page',      priority: 'High',   priorityColor: '#EF4444' },
  { label: 'Follow up with webinar leads', priority: 'Medium', priorityColor: '#F59E0B' },
  { label: 'Prepare newsletter content',   priority: 'Medium', priorityColor: '#F59E0B' },
  { label: 'Analyze campaign performance', priority: 'Low',    priorityColor: '#10B981' },
];

const CHANNEL_PERF = [
  { channel: 'Email',          revenue: 18450, pct: 37, color: '#4F46E5' },
  { channel: 'Social Media',   revenue: 11230, pct: 24, color: '#F59E0B' },
  { channel: 'Paid Ads',       revenue: 12880, pct: 22, color: '#8B5CF6' },
  { channel: 'Organic/ Brand', revenue: 8010,  pct: 14, color: '#10B981' },
  { channel: 'Referral',       revenue: 2480,  pct: 3,  color: '#EF4444' },
];

const Badge = ({ label, color }) => (
  <span style={{ background: `${color}20`, color, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
    {label}
  </span>
);

const SelectPill = ({ value, options, onChange }) => (
  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
    <select value={value} onChange={e => onChange(e.target.value)} style={{ fontSize: 11, fontWeight: 600, color: '#4F46E5', background: '#EDE9FE', border: 'none', borderRadius: 20, padding: '4px 22px 4px 10px', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
    <ChevronDown size={10} color="#4F46E5" style={{ position: 'absolute', right: 6, pointerEvents: 'none' }} />
  </div>
);

const SectionHdr = ({ title, action, actionLabel = 'View All' }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h3>
    {action && (
      <button onClick={action} style={{ fontSize: 11, color: '#4F46E5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, padding: 0 }}>
        {actionLabel} <ChevronRight size={12} />
      </button>
    )}
  </div>
);

const KpiCard = ({ Icon, iconBg, iconColor, title, value, change, subtitle }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.07)', flex: 1, minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 21, fontWeight: 700, color: '#111827', margin: '2px 0 0' }}>{value}</p>
      </div>
    </div>
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 12, fontWeight: 600, color: '#10B981' }}>
        <ArrowUpRight size={13} />{change}
      </span>
      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{subtitle}</span>
    </div>
  </div>
);

const MarketingDashboard = () => {
  const { user } = useAuth();
  const [growthFilter, setGrowthFilter] = useState('This Week');
  const [engFilter,    setEngFilter]    = useState('This Week');
  const [trendFilter,  setTrendFilter]  = useState('Monthly');
  const [checked, setChecked] = useState({ 3: true });
  const toggle = i => setChecked(p => ({ ...p, [i]: !p[i] }));

  const campaignPct = 78;
  const r = 50;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh', padding: '20px 20px 32px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Marketing Dashboard</h1>
          <p style={{ fontSize: 12, color: '#6B7280', margin: '3px 0 0' }}>Welcome back! Here's what's happening with your marketing activities.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#374151' }}>
            <Calendar size={13} color="#6B7280" />
            <span>20 May 2026 – 26 May 2026</span>
            <ChevronDown size={12} color="#6B7280" />
          </div>
          <button style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}>
            <MoreHorizontal size={15} color="#6B7280" />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <KpiCard Icon={Users}      iconBg="#EDE9FE" iconColor="#7C3AED" title="Total Leads"        value="1,248"   change="18.6%" subtitle="vs last 7 days" />
        <KpiCard Icon={Target}     iconBg="#FEF3C7" iconColor="#D97706" title="Qualified Leads"    value="842"     change="12.4%" subtitle="vs last 7 days" />
        <KpiCard Icon={TrendingUp} iconBg="#D1FAE5" iconColor="#059669" title="Conversions"        value="126"     change="14.7%" subtitle="vs last 7 days" />
        <KpiCard Icon={DollarSign} iconBg="#DBEAFE" iconColor="#2563EB" title="Revenue Influenced" value="$48,920" change="22.8%" subtitle="vs last 7 days" />
        <KpiCard Icon={Percent}    iconBg="#FCE7F3" iconColor="#DB2777" title="ROI"                value="312%"    change="9.3%"  subtitle="vs last 7 days" />
      </div>

      {/* Row 2: Lead Growth | Leads by Source | Top Campaigns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr 1fr', gap: 12, marginBottom: 12 }}>

        {/* Lead Growth Overview */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Lead Growth Overview</h3>
            <SelectPill value={growthFilter} options={['This Week','This Month','This Year']} onChange={setGrowthFilter} />
          </div>
          <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
            {[['#4F46E5','Total Leads'],['#10B981','Qualified Leads'],['#F59E0B','Converted Leads']].map(([c,l]) => (
              <span key={l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#6B7280' }}>
                <span style={{ width:16, height:2, background:c, borderRadius:2, display:'inline-block' }} />{l}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={LEAD_GROWTH_DATA} margin={{ top:4, right:4, left:-22, bottom:0 }}>
              <defs>
                <linearGradient id="mg-total"     x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.18}/><stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/></linearGradient>
                <linearGradient id="mg-qualified" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#10B981" stopOpacity={0.18}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                <linearGradient id="mg-converted" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.18}/><stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="date"   tick={{ fontSize:10, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis                  tick={{ fontSize:10, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:'none', boxShadow:'0 4px 12px rgba(0,0,0,.1)' }} />
              <Area type="monotone" dataKey="total"     stroke="#4F46E5" strokeWidth={2} fill="url(#mg-total)"     dot={false} />
              <Area type="monotone" dataKey="qualified" stroke="#10B981" strokeWidth={2} fill="url(#mg-qualified)" dot={false} />
              <Area type="monotone" dataKey="converted" stroke="#F59E0B" strokeWidth={2} fill="url(#mg-converted)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Source */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
          <SectionHdr title="Leads by Source" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChart width={155} height={195}>
              <Pie data={LEADS_BY_SOURCE} cx={75} cy={95} innerRadius={50} outerRadius={72} dataKey="value" stroke="none">
                {LEADS_BY_SOURCE.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <text x={76} y={90}  textAnchor="middle" fill="#111827" fontSize={22} fontWeight={700}>1,248</text>
              <text x={76} y={106} textAnchor="middle" fill="#6B7280" fontSize={11}>Total</text>
            </PieChart>
            <div style={{ flex:1 }}>
              {LEADS_BY_SOURCE.map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:s.color, flexShrink:0 }} />
                    <span style={{ fontSize:11, color:'#374151' }}>{s.name}</span>
                  </div>
                  <div style={{ display:'flex', gap:5, fontSize:11 }}>
                    <span style={{ color:'#9CA3AF' }}>{s.pct}%</span>
                    <span style={{ color:'#111827', fontWeight:600 }}>({s.value})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Campaigns */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
          <SectionHdr title="Top Campaigns" action={() => {}} />
          {TOP_CAMPAIGNS.map((c,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:9, paddingBottom:8, marginBottom: i < TOP_CAMPAIGNS.length-1 ? 8 : 0, borderBottom: i < TOP_CAMPAIGNS.length-1 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${c.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <c.Icon size={15} color={c.color} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, color:'#111827', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</p>
                <p style={{ fontSize:10, color:'#9CA3AF', margin:'1px 0 0' }}>{c.type}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#111827', margin:0 }}>{c.leads}</p>
                <p style={{ fontSize:10, color:'#9CA3AF', margin:'1px 0 0' }}>Leads</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0, minWidth:42 }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#10B981', margin:0 }}>{c.convRate}%</p>
                <p style={{ fontSize:10, color:'#9CA3AF', margin:'1px 0 0' }}>Conv.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Recent Leads | Funnel | Engagement | Activities+Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr 1fr 1fr', gap: 12, marginBottom: 12 }}>

        {/* Recent Leads */}
        <div style={{ background:'#fff', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.07)' }}>
          <SectionHdr title="Recent Leads" action={() => {}} />
          {RECENT_LEADS.map((l,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:9, marginBottom: i < RECENT_LEADS.length-1 ? 10 : 0 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:l.avatarBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#374151', flexShrink:0 }}>
                {l.avatar}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, color:'#111827', margin:0 }}>{l.name}</p>
                <p style={{ fontSize:10, color:'#9CA3AF', margin:'1px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.role}</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2, flexShrink:0 }}>
                <Badge label={l.badge} color={l.badgeColor} />
                <span style={{ fontSize:10, color:'#9CA3AF' }}>{l.time}</span>
              </div>
            </div>
          ))}
          <div style={{ display:'flex', gap:10, marginTop:14, paddingTop:12, borderTop:'1px solid #F3F4F6' }}>
            {[
              { label:'Conversion Rate', value:'10.1%', change:'↑ 1.6%' },
              { label:'Avg. Deal Size',  value:'$3,890', change:'↑ 8.4%' },
            ].map((s,i) => (
              <div key={i} style={{ flex:1, background:'#F9FAFB', borderRadius:8, padding:'9px 10px' }}>
                <p style={{ fontSize:10, color:'#6B7280', margin:0 }}>{s.label}</p>
                <p style={{ fontSize:16, fontWeight:700, color:'#111827', margin:'3px 0 2px' }}>{s.value}</p>
                <span style={{ fontSize:11, color:'#10B981', fontWeight:600 }}>{s.change}</span>
                <span style={{ fontSize:10, color:'#9CA3AF' }}> vs last 7 days</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Status Funnel */}
        <div style={{ background:'#fff', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.07)' }}>
          <SectionHdr title="Lead Status Distribution" />
          {FUNNEL_DATA.map((f,i) => (
            <div key={i} style={{ marginBottom: i < FUNNEL_DATA.length-1 ? 10 : 0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                <span style={{ color:'#6B7280' }}>{f.label}</span>
                <span style={{ fontWeight:700, color:'#111827' }}>{f.value.toLocaleString()}</span>
              </div>
              <div style={{ height:22, background:'#F3F4F6', borderRadius:6, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${f.width}%`, background:f.color, borderRadius:6 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Engagement Overview */}
        <div style={{ background:'#fff', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.07)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#111827', margin:0 }}>Engagement Overview</h3>
            <SelectPill value={engFilter} options={['This Week','This Month']} onChange={setEngFilter} />
          </div>
          {ENGAGEMENT.map((e,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 9px', background:'#F9FAFB', borderRadius:8, marginBottom: i < ENGAGEMENT.length-1 ? 8 : 0 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:`${e.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <e.Icon size={14} color={e.color} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:11, color:'#6B7280', margin:0 }}>{e.label}</p>
                <p style={{ fontSize:14, fontWeight:700, color:'#111827', margin:'2px 0 0' }}>{e.value.toLocaleString()}</p>
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:'#10B981', display:'flex', alignItems:'center', gap:2 }}>
                <ArrowUpRight size={12} />+{e.change}%
              </span>
            </div>
          ))}
        </div>

        {/* Activities + Tasks */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.07)' }}>
            <SectionHdr title="Activities" actionLabel="View Calendar" action={() => {}} />
            {ACTIVITIES_DATA.map((a,i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, marginBottom: i < ACTIVITIES_DATA.length-1 ? 10 : 0 }}>
                <div style={{ width:28, height:28, borderRadius:7, background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <a.Icon size={13} color={a.color} />
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#111827', margin:0 }}>{a.title}</p>
                  <p style={{ fontSize:10, color:'#9CA3AF', margin:'2px 0 0' }}>{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'#fff', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.07)', flex:1 }}>
            <SectionHdr title="Tasks" action={() => {}} />
            {TASKS_DATA.map((t,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom: i < TASKS_DATA.length-1 ? 9 : 0 }}>
                <input type="checkbox" checked={!!checked[i]} onChange={() => toggle(i)}
                  style={{ width:13, height:13, accentColor:'#4F46E5', cursor:'pointer', flexShrink:0 }} />
                <span style={{ fontSize:12, color: checked[i] ? '#9CA3AF' : '#374151', flex:1, textDecoration: checked[i] ? 'line-through' : 'none' }}>
                  {t.label}
                </span>
                <Badge label={t.priority} color={t.priorityColor} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Performance Trend | Channel Performance */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:12 }}>

        {/* Marketing Performance Trend */}
        <div style={{ background:'#fff', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.07)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:'#111827', margin:0 }}>Marketing Performance Trend</h3>
            <SelectPill value={trendFilter} options={['Monthly','Quarterly','Yearly']} onChange={setTrendFilter} />
          </div>
          <div style={{ display:'flex', gap:16, marginBottom:10 }}>
            {[['#4F46E5','Leads'],['#10B981','Conversions'],['#8B5CF6','Revenue']].map(([c,l]) => (
              <span key={l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#6B7280' }}>
                <span style={{ width:14, height:2, background:c, borderRadius:2, display:'inline-block' }} />{l}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PERFORMANCE_TREND} margin={{ top:4, right:8, left:-16, bottom:0 }} barSize={13} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize:10, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize:10, fill:'#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}K`} />
              <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:'none', boxShadow:'0 4px 12px rgba(0,0,0,.1)' }} />
              <Bar yAxisId="left" dataKey="leads"       fill="#4F46E5" radius={[4,4,0,0]} />
              <Bar yAxisId="left" dataKey="conversions" fill="#10B981" radius={[4,4,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r:4, fill:'#8B5CF6', strokeWidth:0 }} activeDot={{ r:6 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Performance + Campaign Status */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#fff', borderRadius:12, padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,.07)', flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:'#111827', margin:0 }}>Channel Performance</h3>
              <SelectPill value="This Month" options={['This Month','Last Month']} onChange={() => {}} />
            </div>
            {CHANNEL_PERF.map((c,i) => (
              <div key={i} style={{ marginBottom: i < CHANNEL_PERF.length-1 ? 10 : 0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                  <span style={{ color:'#374151', fontWeight:500 }}>{c.channel}</span>
                  <div style={{ display:'flex', gap:6 }}>
                    <span style={{ color:'#111827', fontWeight:700 }}>${c.revenue.toLocaleString()}</span>
                    <span style={{ color:'#9CA3AF' }}>({c.pct}%)</span>
                  </div>
                </div>
                <div style={{ height:5, background:'#F3F4F6', borderRadius:4 }}>
                  <div style={{ height:'100%', width:`${c.pct}%`, background:c.color, borderRadius:4 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Campaign Status Ring */}
          <div style={{ background:'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)', borderRadius:12, padding:'16px 18px', textAlign:'center' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:'0 0 10px' }}>Campaign Status</p>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <svg width={120} height={120} viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth={11} />
                <circle cx="60" cy="60" r={r} fill="none" stroke="#fff" strokeWidth={11}
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - campaignPct / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)" />
                <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="21" fontWeight="700">{campaignPct}%</text>
                <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,.8)" fontSize="10">Active</text>
              </svg>
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.85)', margin:'8px 0 10px' }}>
              Active Campaigns<br /><strong>14 / 18 Running</strong>
            </p>
            <button style={{ width:'100%', padding:'7px', background:'rgba(255,255,255,.2)', border:'1px solid rgba(255,255,255,.3)', borderRadius:8, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              View All Campaigns
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
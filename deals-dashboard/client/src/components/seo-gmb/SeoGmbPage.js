import React, { useState, useEffect } from 'react';
import SeoGmbProjectSelector from './SeoGmbProjectSelector';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  CheckCircle, Clock, AlertCircle, Circle, ChevronRight,
  ArrowUpRight, ArrowDownRight, Download, Calendar,
  MoreHorizontal, Eye, TrendingUp, Activity, ChevronDown,
  ExternalLink, User, FileText, Globe, Star, Zap, Target,
  BookOpen, BarChart2, Link, Search, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/* ── Static Data ── */
const WORKFLOW_STEPS = [
  { num: '01', label: 'Website Audit', status: 'completed', date: 'Completed' },
  { num: '02', label: 'Competitor Research', status: 'completed', date: 'Completed' },
  { num: '03', label: 'Keyword Research', status: 'completed', date: 'Completed' },
  { num: '04', label: 'SEO Strategy', status: 'approved', date: 'Approved' },
  { num: '05', label: 'On-Page SEO', status: 'progress', date: 'In Progress' },
  { num: '06', label: 'Content Creation', status: 'progress', date: 'In Progress' },
  { num: '07', label: 'Off-Page SEO', status: 'pending', date: 'Pending' },
  { num: '08', label: 'Rank Tracking', status: 'pending', date: 'Pending' },
  { num: '09', label: 'Reporting', status: 'pending', date: 'Pending' },
];

const SEO_SCORE_DATA = [
  { date: '20 Apr', score: 38 },
  { date: '27 Apr', score: 45 },
  { date: '04 May', score: 55 },
  { date: '11 May', score: 68 },
  { date: '16 May', score: 74 },
];

const TASK_PIE = [
  { name: 'Completed', value: 12, pct: 35, color: '#10B981' },
  { name: 'In Progress', value: 10, pct: 29, color: '#4F46E5' },
  { name: 'Pending', value: 8, pct: 24, color: '#F59E0B' },
  { name: 'On Hold', value: 4, pct: 12, color: '#EF4444' },
];

const WORKFLOW_ROWS = [
  { num: '01', step: 'Website Audit', desc: 'Cover website and analyse technical, on-page, and off-site issues.', owner: 'Michael Brown', ownerInit: 'MB', ownerBg: '#EDE9FE', status: 'Completed', statusColor: '#10B981', progress: 100, due: '20 Apr 2026', action: 'View Report', actionColor: '#4F46E5' },
  { num: '02', step: 'Competitor Research', desc: 'Analyse top competitors for keywords, backlinks & strategies.', owner: 'Sophia Davis', ownerInit: 'SD', ownerBg: '#FEF3C7', status: 'Completed', statusColor: '#10B981', progress: 100, due: '25 Apr 2026', action: 'View Report', actionColor: '#4F46E5' },
  { num: '03', step: 'Keyword Research', desc: 'Find high-value keywords for targeting.', owner: 'Daniel Martinez', ownerInit: 'DM', ownerBg: '#DBEAFE', status: 'Completed', statusColor: '#10B981', progress: 100, due: '30 Apr 2026', action: 'View Report', actionColor: '#4F46E5' },
  { num: '04', step: 'SEO Strategy', desc: 'Develop SEO roadmap and get client approval.', owner: 'Emma Johnson', ownerInit: 'EJ', ownerBg: '#D1FAE5', status: 'Approved', statusColor: '#8B5CF6', progress: 100, due: '05 May 2026', action: 'View Strategy', actionColor: '#8B5CF6' },
  { num: '05', step: 'On-Page SEO', desc: 'Optimize meta tags, headings, content, images, internal links.', owner: 'Olivia Taylor', ownerInit: 'OT', ownerBg: '#FCE7F3', status: 'In Progress', statusColor: '#4F46E5', progress: 70, due: '20 May 2026', action: 'Continue', actionColor: '#10B981' },
  { num: '06', step: 'Content Creation', desc: 'Create content for blog, landing pages & service pages.', owner: 'James Wilson', ownerInit: 'JW', ownerBg: '#FEE2E2', status: 'In Progress', statusColor: '#4F46E5', progress: 40, due: '30 May 2026', action: 'Continue', actionColor: '#10B981' },
  { num: '07', step: 'Off-Page SEO', desc: 'Build backlinks, guest posts & PR submissions.', owner: 'William Anderson', ownerInit: 'WA', ownerBg: '#E0F2FE', status: 'Pending', statusColor: '#F59E0B', progress: 0, due: '15 Jun 2026', action: 'Start', actionColor: '#6B7280' },
  { num: '08', step: 'Rank Tracking', desc: 'Track keyword rankings and SERP performance.', owner: 'Ava Thomas', ownerInit: 'AT', ownerBg: '#FEF9C3', status: 'Pending', statusColor: '#F59E0B', progress: 0, due: '01 Jul 2026', action: 'Start', actionColor: '#6B7280' },
  { num: '09', step: 'Reporting', desc: 'Prepare reports and client performance reviews.', owner: 'Emma Johnson', ownerInit: 'EJ', ownerBg: '#D1FAE5', status: 'Pending', statusColor: '#F59E0B', progress: 0, due: '05 Jul 2026', action: 'Start', actionColor: '#6B7280' },
];

const RECENT_ACTIVITY = [
  { color: '#4F46E5', bg: '#EDE9FE', icon: CheckCircle, title: 'Technical audit completed', by: 'Michael Brown', date: '20 May 2026, 10:30 AM' },
  { color: '#10B981', bg: '#D1FAE5', icon: Search, title: '25 new keywords added', by: 'Daniel Martinez', date: '20 May 2026, 09:15 AM' },
  { color: '#8B5CF6', bg: '#EDE9FE', icon: Activity, title: 'On-page optimization 70% done', by: 'Olivia Taylor', date: '19 May 2026, 04:45 PM' },
  { color: '#F59E0B', bg: '#FEF3C7', icon: Link, title: 'Backlink outreach started', by: 'William Anderson', date: '19 May 2026, 02:20 PM' },
  { color: '#EF4444', bg: '#FEE2E2', icon: BookOpen, title: 'New blog published', by: 'James Wilson', date: '18 May 2026, 11:10 AM' },
];

const NEXT_STEPS = [
  { label: 'Complete on-page optimization', due: 'Due: 20 May 2026', priority: 'Medium', priorityColor: '#F59E0B' },
  { label: 'Publish 3 more blogs', due: 'Due: 25 May 2026', priority: 'Medium', priorityColor: '#F59E0B' },
  { label: 'Build 20 quality backlinks', due: 'Due: 15 Jun 2026', priority: 'High', priorityColor: '#EF4444' },
  { label: 'Improve Core Web Vitals', due: 'Due: 30 Jun 2026', priority: 'High', priorityColor: '#EF4444' },
];

const KEY_METRICS = [
  { label: 'Total Clicks', value: '24.6K', change: 18.8, up: true, color: '#4F46E5', spark: [30, 38, 32, 45, 40, 52, 55, 61, 58, 65, 70, 75] },
  { label: 'Total Impressions', value: '320K', change: 12.5, up: true, color: '#10B981', spark: [200, 220, 210, 240, 230, 260, 270, 280, 265, 290, 310, 320] },
  { label: 'Average CTR', value: '7.68%', change: 8.4, up: true, color: '#8B5CF6', spark: [5, 5.5, 5.2, 6, 5.8, 6.5, 6.8, 7, 6.9, 7.2, 7.5, 7.68] },
  { label: 'Average Position', value: '18.6', change: 4.2, up: false, color: '#EF4444', spark: [25, 23, 24, 22, 21, 20, 21, 19, 20, 19, 18.8, 18.6] },
  { label: 'Backlinks', value: '1.2K', change: 15.3, up: true, color: '#F59E0B', spark: [800, 850, 820, 900, 880, 950, 980, 1020, 1000, 1100, 1150, 1200] },
  { label: 'Referring Domains', value: '256', change: 11.2, up: true, color: '#06B6D4', spark: [180, 185, 188, 195, 200, 210, 215, 220, 230, 240, 250, 256] },
  { label: 'Domain Authority', value: '32', change: 5, up: true, color: '#EC4899', spark: [22, 23, 24, 25, 26, 27, 27, 28, 29, 30, 31, 32] },
];

/* ── Helpers ── */
const Sparkline = ({ data, color, up }) => (
  <ResponsiveContainer width="100%" height={40}>
    <AreaChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.25} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
        fill={`url(#sg-${color.replace('#', '')})`} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

const StatusBadge = ({ status, color }) => {
  const cfg = {
    'Completed': { bg: '#D1FAE5', text: '#065F46' },
    'Approved': { bg: '#EDE9FE', text: '#5B21B6' },
    'In Progress': { bg: '#DBEAFE', text: '#1E40AF' },
    'Pending': { bg: '#FEF3C7', text: '#92400E' },
  }[status] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span style={{ background: cfg.bg, color: cfg.text, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const stepIcon = (status) => {
  if (status === 'completed') return <CheckCircle size={16} color="#10B981" />;
  if (status === 'approved') return <CheckCircle size={16} color="#8B5CF6" />;
  if (status === 'progress') return <Clock size={16} color="#4F46E5" />;
  return <Circle size={16} color="#D1D5DB" />;
};

/* ── Main Component ── */
const SeoGmbPage = () => {
  const { user } = useAuth();
  const [scoreFilter, setScoreFilter] = useState('Monthly');
  const [project, setProject] = useState(null);

  const loadProjectData = async (proj) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${proj.id}`);
      if (response.ok) {
        const pData = await response.json();
        setProject(pData);
      }
    } catch (err) {
      console.error('Error loading project details in dashboard:', err);
    }
  };

  const handleProjectChange = (proj) => {
    loadProjectData(proj);
  };

  const handleWorkflowAction = (row) => {
    switch (row.step) {
      case 'Website Audit':
        window.location.href = '/seo-gmb/website-audit';
        break;
      case 'Competitor Research':
        alert(`Competitor Research Strategy details: Target Competitors include Zenith Corp and Alpha Leads. 48 overlapping key phrases identified.`);
        break;
      case 'Keyword Research':
        window.location.href = '/seo-gmb/keyword-management';
        break;
      case 'SEO Strategy':
        alert(`SEO Strategic Blueprint Checklist:\n1. Fix all 4XX and crawl loops.\n2. Optimize alt elements and trailing slashes.\n3. Publish weekly pillar topics.\n4. Build 20 High-DA backlinks monthly.\n5. Align Google Posts schedule.`);
        break;
      case 'On-Page SEO':
        window.location.href = '/seo-gmb/on-page-seo';
        break;
      case 'Content Creation':
        window.location.href = '/seo-gmb/content-marketing';
        break;
      case 'Off-Page SEO':
        window.location.href = '/seo-gmb/off-page-seo';
        break;
      case 'Rank Tracking':
        window.location.href = '/seo-gmb/rank-tracking';
        break;
      case 'Reporting':
        window.location.href = '/seo-gmb/reports';
        break;
      default:
        break;
    }
  };

  const handleDownloadReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download/print the PDF report.");
      return;
    }

    const domain = project ? `${project.name.toLowerCase().replace(/ /g, '')}.com` : 'technova.com';
    const companyName = project?.company_name || currentProjectName;
    const managerName = project?.manager || 'Emma Johnson';
    const auditTimeStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>SEO & GMB Performance Report - www.${domain}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #1e293b;
      font-size: 11px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      height: 297mm;
      background: white;
      margin: 0 auto;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      box-sizing: border-box;
      display: flex;
      position: relative;
      overflow: hidden;
    }
    .page-break {
      page-break-before: always;
    }
    /* Sidebar styling */
    .sidebar {
      width: 220px;
      background-color: #0a192f;
      color: white;
      padding: 24px 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-circle {
      width: 24px;
      height: 24px;
      background-color: #3b82f6;
      border-radius: 50%;
    }
    .logo-text {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .logo-sub {
      font-size: 8px;
      color: #94a3b8;
    }
    .report-title {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.1;
      margin-top: 40px;
      letter-spacing: -0.5px;
    }
    .sidebar-domain {
      color: #3b82f6;
      font-weight: 600;
      font-size: 10px;
      margin-top: 8px;
      word-break: break-all;
    }
    .meta-list {
      margin-top: 60px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .meta-item-label {
      font-size: 8px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .meta-item-val {
      font-size: 11px;
      font-weight: 700;
      color: white;
    }
    .sidebar-footer {
      font-size: 8px;
      color: #64748b;
      font-weight: 500;
    }

    /* Main body styling */
    .main-body {
      flex: 1;
      padding: 24px 24px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      background-color: white;
    }
    .section-header {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0f172a;
      border-bottom: 1.5px solid #f1f5f9;
      padding-bottom: 4px;
      margin-bottom: 12px;
      margin-top: 14px;
    }
    .executive-row {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1.2fr;
      gap: 16px;
      align-items: start;
    }
    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-icon {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      background-color: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }
    .info-text {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 8px;
      color: #64748b;
      font-weight: 500;
    }
    .info-val {
      font-size: 9.5px;
      font-weight: 700;
      color: #1e293b;
    }
    
    /* Circle Gauge */
    .score-circle-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .score-circle {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .score-circle-text {
      position: absolute;
      text-align: center;
    }
    .score-circle-num {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }
    .score-circle-label {
      font-size: 8px;
      color: #64748b;
    }
    .score-badge {
      background-color: #10b981;
      color: white;
      font-weight: 700;
      padding: 3px 12px;
      border-radius: 12px;
      font-size: 9px;
      margin-top: 6px;
      text-align: center;
    }
    
    /* Breakdown progress bars */
    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .breakdown-row {
      display: flex;
      flex-direction: column;
    }
    .breakdown-info {
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      font-weight: 600;
      margin-bottom: 2px;
      color: #475569;
    }
    .breakdown-track {
      background-color: #f1f5f9;
      height: 4.5px;
      border-radius: 3px;
      overflow: hidden;
    }
    .breakdown-bar {
      height: 100%;
      border-radius: 3px;
    }

    /* Key metrics grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      margin-top: 6px;
    }
    .metric-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 4px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .metric-icon {
      font-size: 12px;
      margin-bottom: 4px;
    }
    .metric-label {
      font-size: 7.5px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
      font-weight: 500;
    }
    .metric-val {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
    }
    .metric-change {
      font-size: 7.5px;
      font-weight: 700;
      margin-top: 2px;
    }
    .change-up { color: #10b981; }
    .change-down { color: #ef4444; }

    /* Layout lower row split */
    .lower-split {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-top: 14px;
      flex: 1;
    }
    .issues-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5px;
    }
    .issues-table th {
      background-color: #f8fafc;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      padding: 6px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .issues-table td {
      padding: 6px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .status-badge {
      padding: 1.5px 5px;
      border-radius: 3px;
      font-weight: 700;
      font-size: 7.5px;
    }
    .stat-comp { background-color: #d1fae5; color: #065f46; }
    .stat-prog { background-color: #dbeafe; color: #1e40af; }
    .stat-pend { background-color: #fef3c7; color: #92400e; }

    .recommendations-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .rec-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px;
      border: 1px solid #f1f5f9;
      background-color: #fafafa;
      border-radius: 4px;
    }
    .rec-info {
      font-size: 8px;
      color: #334155;
    }
    
    .signature-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      margin-top: 16px;
      align-items: flex-end;
    }
    .sig-block {
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 30px;
      display: inline-block;
      width: 140px;
    }
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .qr-img {
      width: 50px;
      height: 50px;
      border: 1px solid #cbd5e1;
      padding: 3px;
      border-radius: 4px;
    }
    
    /* Footer styles */
    .footer-bar {
      display: flex;
      justify-content: space-between;
      background-color: #0a192f;
      color: white;
      padding: 6px 12px;
      font-size: 7.5px;
      margin-top: auto;
      box-sizing: border-box;
      width: 100%;
    }
    .footer-bar span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Print specific optimization to fit inside paper height */
    @media print {
      body {
        background-color: white;
      }
      .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
        height: 297mm;
      }
    }
  </style>
</head>
<body>

  <!-- ======================== PAGE 1 ======================== -->
  <div class="page">
    <!-- Left Sidebar -->
    <div class="sidebar">
      <div>
        <div class="logo-container">
          <div class="logo-circle"></div>
          <div>
            <div class="logo-text">YOUR LOGO</div>
            <div class="logo-sub">Tagline Goes Here</div>
          </div>
        </div>
        <div class="report-title">SEO & GMB<br/>DASHBOARD<br/>REPORT</div>
        <div class="sidebar-domain">www.${domain}</div>
        
        <div class="meta-list">
          <div>
            <div class="meta-item-label">Client Name</div>
            <div class="meta-item-val">${companyName}</div>
          </div>
          <div>
            <div class="meta-item-label">Prepared By</div>
            <div class="meta-item-val">Codigix Infotech Pvt. Ltd.</div>
          </div>
          <div>
            <div class="meta-item-label">SEO Consultant</div>
            <div class="meta-item-val">${managerName}</div>
          </div>
          <div>
            <div class="meta-item-label">Audit Date</div>
            <div class="meta-item-val">${auditTimeStr}</div>
          </div>
          <div>
            <div class="meta-item-label">Report Version</div>
            <div class="meta-item-val">v1.0</div>
          </div>
        </div>
      </div>
      <div class="sidebar-footer">
        © 2026 Codigix Infotech. Confidential.
      </div>
    </div>

    <!-- Main Content Panel -->
    <div class="main-body">
      <!-- Executive Summary -->
      <div class="section-header">Executive Summary</div>
      <div class="executive-row">
        <!-- Site Details -->
        <div class="info-grid">
          <div class="info-row">
            <div class="info-icon">🌐</div>
            <div class="info-text">
              <span class="info-label">Website</span>
              <span class="info-val">www.${domain}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-icon">📈</div>
            <div class="info-text">
              <span class="info-label">Industry</span>
              <span class="info-val">Software / Technology</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-icon">👤</div>
            <div class="info-text">
              <span class="info-label">Project Manager</span>
              <span class="info-val">${managerName}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-icon">📅</div>
            <div class="info-text">
              <span class="info-label">Report Date</span>
              <span class="info-val">${auditTimeStr}</span>
            </div>
          </div>
        </div>

        <!-- Overall Score Ring -->
        <div class="score-circle-container">
          <div class="score-circle">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" stroke-width="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#10b981" stroke-width="6"
                stroke-dasharray="213.6" stroke-dashoffset="${213.6 - (213.6 * 87) / 100}"
                stroke-linecap="round" transform="rotate(-90 40 40)" />
            </svg>
            <div class="score-circle-text">
              <div class="score-circle-num">87</div>
              <div class="score-circle-label">/100</div>
            </div>
          </div>
          <div style="font-size: 7.5px; font-weight:700; color:#64748b; text-transform:uppercase; margin-top:2px;">Overall SEO Score</div>
          <div class="score-badge">Good</div>
        </div>

        <!-- Score Breakdown Bars -->
        <div class="breakdown-list">
          <div class="breakdown-row">
            <div class="breakdown-info">
              <span>Technical SEO</span>
              <span>90/100</span>
            </div>
            <div class="breakdown-track">
              <div class="breakdown-bar" style="background-color:#3b82f6; width:90%;"></div>
            </div>
          </div>
          <div class="breakdown-row">
            <div class="breakdown-info">
              <span>On-Page SEO</span>
              <span>85/100</span>
            </div>
            <div class="breakdown-track">
              <div class="breakdown-bar" style="background-color:#10b981; width:85%;"></div>
            </div>
          </div>
          <div class="breakdown-row">
            <div class="breakdown-info">
              <span>Core Web Vitals</span>
              <span>75/100</span>
            </div>
            <div class="breakdown-track">
              <div class="breakdown-bar" style="background-color:#f59e0b; width:75%;"></div>
            </div>
          </div>
          <div class="breakdown-row">
            <div class="breakdown-info">
              <span>Mobile Usability</span>
              <span>92/100</span>
            </div>
            <div class="breakdown-track">
              <div class="breakdown-bar" style="background-color:#8b5cf6; width:92%;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Website Overview Grid -->
      <div class="section-header">Performance Metrics (Key KPI Indicators)</div>
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-icon">🖱️</span>
          <span class="metric-label">Total Clicks</span>
          <span class="metric-val">24.6K</span>
          <span class="metric-change change-up">▲ 18.8%</span>
        </div>
        <div class="metric-card">
          <span class="metric-icon">👁️</span>
          <span class="metric-label">Impressions</span>
          <span class="metric-val">320K</span>
          <span class="metric-change change-up">▲ 12.5%</span>
        </div>
        <div class="metric-card">
          <span class="metric-icon">📊</span>
          <span class="metric-label">Average CTR</span>
          <span class="metric-val">7.68%</span>
          <span class="metric-change change-up">▲ 8.4%</span>
        </div>
        <div class="metric-card">
          <span class="metric-icon">📍</span>
          <span class="metric-label">Avg. Position</span>
          <span class="metric-val">18.6</span>
          <span class="metric-change change-up">▲ 4.2%</span>
        </div>
        <div class="metric-card">
          <span class="metric-icon">🔗</span>
          <span class="metric-label">Backlinks</span>
          <span class="metric-val">1.2K</span>
          <span class="metric-change change-up">▲ 15.3%</span>
        </div>
        <div class="metric-card">
          <span class="metric-icon">🌐</span>
          <span class="metric-label">Referring Domains</span>
          <span class="metric-val">256</span>
          <span class="metric-change change-up">▲ 11.2%</span>
        </div>
        <div class="metric-card">
          <span class="metric-icon">🏆</span>
          <span class="metric-label">Domain Authority</span>
          <span class="metric-val">32</span>
          <span class="metric-change change-up">▲ 5%</span>
        </div>
      </div>

      <!-- Split section: Issues Table + Core Web Vitals -->
      <div class="lower-split">
        <!-- Issues table left -->
        <div>
          <div style="font-size: 10px; font-weight:800; text-transform:uppercase; color:#0f172a; margin-bottom:8px;">Workflow Steps & Details</div>
          <table class="issues-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Description</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight:700;">01. Website Audit</td>
                <td>Cover website and analyse technical parameters.</td>
                <td>Michael Brown</td>
                <td><span class="status-badge stat-comp">Completed</span></td>
                <td style="font-weight:700;">100%</td>
              </tr>
              <tr>
                <td style="font-weight:700;">02. Competitor Research</td>
                <td>Analyse top competitors for keywords & backlinks.</td>
                <td>Sophia Davis</td>
                <td><span class="status-badge stat-comp">Completed</span></td>
                <td style="font-weight:700;">100%</td>
              </tr>
              <tr>
                <td style="font-weight:700;">03. Keyword Research</td>
                <td>Find high-value keywords for targeting.</td>
                <td>Daniel Martinez</td>
                <td><span class="status-badge stat-comp">Completed</span></td>
                <td style="font-weight:700;">100%</td>
              </tr>
              <tr>
                <td style="font-weight:700;">04. SEO Strategy</td>
                <td>Develop SEO roadmap and blueprints.</td>
                <td>Emma Johnson</td>
                <td><span class="status-badge stat-comp">Completed</span></td>
                <td style="font-weight:700;">100%</td>
              </tr>
              <tr>
                <td style="font-weight:700;">05. On-Page SEO</td>
                <td>Optimize headings, speed, and meta elements.</td>
                <td>Olivia Taylor</td>
                <td><span class="status-badge stat-prog">In Progress</span></td>
                <td style="font-weight:700;">70%</td>
              </tr>
              <tr>
                <td style="font-weight:700;">06. Content Creation</td>
                <td>Create content for blogs and service pages.</td>
                <td>James Wilson</td>
                <td><span class="status-badge stat-prog">In Progress</span></td>
                <td style="font-weight:700;">40%</td>
              </tr>
              <tr>
                <td style="font-weight:700;">07. Off-Page SEO</td>
                <td>Build authority backlinks and guest posts.</td>
                <td>William Anderson</td>
                <td><span class="status-badge stat-pend">Pending</span></td>
                <td style="font-weight:700;">0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="footer-bar" style="margin-top:20px;">
        <span>📞 +91 12345 67890</span>
        <span>✉️ info@codigix.com</span>
        <span>🌐 www.codigix.com</span>
        <span>📍 Pune, Maharashtra, India</span>
      </div>
    </div>
  </div>

  <!-- ======================== PAGE 2 ======================== -->
  <div class="page page-break">
    <!-- Left Sidebar -->
    <div class="sidebar">
      <div>
        <div class="logo-container">
          <div class="logo-circle"></div>
          <div>
            <div class="logo-text">YOUR LOGO</div>
            <div class="logo-sub">Tagline Goes Here</div>
          </div>
        </div>
        <div class="report-title">SEO & GMB<br/>DASHBOARD<br/>REPORT</div>
        <div class="sidebar-domain">www.${domain}</div>
        
        <div class="meta-list">
          <div>
            <div class="meta-item-label">Client Name</div>
            <div class="meta-item-val">${companyName}</div>
          </div>
          <div>
            <div class="meta-item-label">SEO Consultant</div>
            <div class="meta-item-val">${managerName}</div>
          </div>
          <div>
            <div class="meta-item-label">Report ID</div>
            <div class="meta-item-val">PERF-931B</div>
          </div>
        </div>
      </div>
      <div class="sidebar-footer">
        © 2026 Codigix Infotech. Confidential.
      </div>
    </div>

    <!-- Main Content Panel Page 2 -->
    <div class="main-body">
      <div class="section-header">Next Priorities & Key Checklist</div>
      
      <div class="recommendations-col" style="margin-top:10px;">
        <div class="rec-item">
          <span class="rec-info"><strong>Publish weekly blogs:</strong> Write and submit at least 3 keyword-targeted blogs to boost organic authority.</span>
          <span class="status-badge stat-prog">In Progress</span>
        </div>
        <div class="rec-item">
          <span class="rec-info"><strong>Build backlink profiles:</strong> Build 20 High-DA backlinks on targeted digital marketing keywords.</span>
          <span class="status-badge stat-comp">Approved</span>
        </div>
        <div class="rec-item">
          <span class="rec-info"><strong>Resolve crawler warnings:</strong> Optimize crawl alt tags and redirect loops on page.</span>
          <span class="status-badge stat-comp">Completed</span>
        </div>
        <div class="rec-item">
          <span class="rec-info"><strong>Align local SEO maps:</strong> Sync sitemaps index directives inside robots.txt schema.</span>
          <span class="status-badge stat-pend">Pending</span>
        </div>
      </div>

      <div class="section-header">Executive Dashboard Summary</div>
      <div class="signature-row" style="grid-template-columns: 2fr 1fr; gap:20px; align-items:flex-end;">
        <div>
          <div style="font-size: 9px; color:#334155; line-height: 1.6;">
            The project campaign exhibits solid execution progress. The foundational audit and keyword research phases are fully completed. Current efforts are concentrated on on-page SEO modifications and accelerating content generation schedules to rank higher for targeted phrases.
          </div>
          <div class="sig-block" style="margin-top:40px;">
            <div style="font-weight:800; font-size:9.5px; color:#0f172a;">${managerName}</div>
            <div style="font-size:7.5px; color:#64748b;">SEO Director / PM</div>
          </div>
        </div>
        
        <div class="qr-container">
          <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.${domain}" alt="QR code" />
          <span style="font-size: 7px; color: #64748b; font-weight: 700; margin-top: 4px; text-align: center;">Scan to view live dashboard report</span>
        </div>
      </div>

      <div class="footer-bar">
        <span>📞 +91 12345 67890</span>
        <span>✉️ info@codigix.com</span>
        <span>🌐 www.codigix.com</span>
        <span>📍 Pune, Maharashtra, India</span>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() {
          window.close();
        }, 1000);
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const currentProjectName = project ? project.name : 'TechNova Solutions';
  const currentStatus = project ? project.status : 'Active';

  const seoScore = 87;
  const r = 52, circ = 2 * Math.PI * r;
  const scoreOffset = circ * (1 - seoScore / 100);

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Inter','Segoe UI',sans-serif", padding: '0 0 32px 0' }}>

      {/* ── Top Bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Project:</span>
          <SeoGmbProjectSelector onProjectChange={handleProjectChange} />
          <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={11} /> {currentStatus}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => document.getElementById('workflow-details-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', background: 'none', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 12px', cursor: 'pointer' }}>
            <BarChart2 size={13} /> Timeline View
          </button>
          <button onClick={handleDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', background: 'none', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 12px', cursor: 'pointer' }}>
            <Download size={13} /> Download Report
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', background: 'none', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 12px' }}>
            <Calendar size={13} color="#6B7280" />
            <span>20 May 2026 – 26 May 2026</span>
            <ChevronDown size={11} color="#6B7280" />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>

        {/* ── SEO Working Flow ── */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>SEO Working Flow</h3>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto' }}>
            {WORKFLOW_STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 100 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%',
                    background: s.status === 'completed' ? '#D1FAE5' : s.status === 'approved' ? '#EDE9FE' : s.status === 'progress' ? '#DBEAFE' : '#F3F4F6',
                    marginBottom: 6
                  }}>
                    {stepIcon(s.status)}
                  </div>
                  <div style={{ fontSize: 9, color: '#6B7280', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
                    <div style={{ color: '#111827', fontWeight: 700, fontSize: 10 }}>{s.label}</div>
                    <div style={{ marginTop: 2, color: s.status === 'completed' ? '#059669' : s.status === 'approved' ? '#7C3AED' : s.status === 'progress' ? '#1D4ED8' : '#9CA3AF' }}>{s.date}</div>
                  </div>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 13, paddingBottom: 4 }}>
                    <div style={{ width: 20, height: 1, background: s.status === 'completed' ? '#10B981' : '#E5E7EB' }} />
                    <ArrowRight size={10} color={s.status === 'completed' ? '#10B981' : '#D1D5DB'} style={{ margin: '0 -2px' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Row: Project Overview + SEO Score + Task Summary ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: 14, marginBottom: 14 }}>

          {/* Project Overview */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Project Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              {[
                { label: 'Website', value: project ? `www.${project.name.toLowerCase().replace(/ /g, '')}.com` : 'www.technova.com' },
                { label: 'Industry', value: project?.industry || 'Software / Technology' },
                { label: 'Project Manager', value: project?.manager || 'Emma Johnson', isUser: true },
              ].map((r, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {r.isUser && <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#1D4ED8', flexShrink: 0 }}>{(project?.manager || 'Emma Johnson').split(' ').map(n=>n[0]).join('')}</div>}
                    {r.value}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              {[
                { label: 'Start Date', value: project?.start_date || '15 Apr 2026' },
                { label: 'Target Date', value: project?.due_date || '15 Oct 2026' },
                { label: 'Contract Value', value: project ? `₹ ${parseFloat(project.budget || 0).toLocaleString()}` : '$4,500.00' },
                { label: 'Keywords', value: '256' },
              ].map((r, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500, marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{r.value}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: '#F3F4F6', marginBottom: 12 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Top 3 Keywords', value: '45' },
                { label: 'Top 10 Keywords', value: '128' },
                { label: 'Organic Traffic', value: '12.4K', change: '+18.6%', up: true },
                { label: 'Organic Leads', value: '320', change: '+27.5%', up: true },
              ].map((r, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{r.value}</div>
                  {r.change && (
                    <div style={{ fontSize: 10, color: r.up ? '#10B981' : '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
                      <ArrowUpRight size={11} />{r.change}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SEO Score Progress */}


          {/* Task Summary */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Task Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 10 }}>
              <PieChart width={150} height={150}>
                <Pie data={TASK_PIE} cx={73} cy={73} innerRadius={48} outerRadius={68} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {TASK_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <text x={74} y={68} textAnchor="middle" fill="#6B7280" fontSize={10}>Total</text>
                <text x={74} y={84} textAnchor="middle" fill="#111827" fontSize={22} fontWeight={700}>34</text>
              </PieChart>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TASK_PIE.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: t.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{t.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{t.value} ({t.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row: Workflow Details + Right Panel ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, marginBottom: 14 }}>

          {/* Workflow Details */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
            <h3 id="workflow-details-section" style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Workflow Details</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Step', 'Description', 'Owner', 'Status', 'Progress', 'Due Date', 'Action'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WORKFLOW_ROWS.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%', background:
                              row.status === 'Completed' ? '#D1FAE5' : row.status === 'Approved' ? '#EDE9FE' : row.status === 'In Progress' ? '#DBEAFE' : '#FEF3C7',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#374151', flexShrink: 0
                          }}>{row.num}</div>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{row.step}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px', color: '#6B7280', maxWidth: 180 }}>
                        <div style={{ fontSize: 11, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{row.desc}</div>
                      </td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: row.ownerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#374151', flexShrink: 0 }}>{row.ownerInit}</div>
                          <span style={{ fontSize: 11, color: '#374151' }}>{row.owner}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px' }}><StatusBadge status={row.status} /></td>
                      <td style={{ padding: '10px 10px', minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 5, background: '#E5E7EB', borderRadius: 4 }}>
                            <div style={{ height: '100%', width: `${row.progress}%`, background: row.progress === 100 ? '#10B981' : row.progress > 0 ? '#4F46E5' : '#E5E7EB', borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, minWidth: 28, textAlign: 'right' }}>{row.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', fontSize: 11, color: '#6B7280' }}>{row.due}</td>
                      <td style={{ padding: '10px 10px' }}>
                        <button onClick={() => handleWorkflowAction(row)} style={{ fontSize: 11, fontWeight: 600, color: row.actionColor, background: `${row.actionColor}15`, border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {row.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Recent Activity + Next Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Recent Activity */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Activity</h3>
                <button style={{ fontSize: 11, color: '#4F46E5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                  View All <ChevronRight size={12} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RECENT_ACTIVITY.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <a.icon size={13} color={a.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0 }}>{a.title}</p>
                      <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0 0' }}>By {a.by}</p>
                      <p style={{ fontSize: 10, color: '#C4B5FD', margin: '1px 0 0' }}>{a.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.07)', flex: 1 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Next Steps</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {NEXT_STEPS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 9px', background: '#F9FAFB', borderRadius: 8 }}>
                    <Circle size={12} color="#D1D5DB" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#111827', margin: 0 }}>{s.label}</p>
                      <p style={{ fontSize: 10, color: '#9CA3AF', margin: '2px 0 0' }}>{s.due}</p>
                    </div>
                    <span style={{ background: `${s.priorityColor}20`, color: s.priorityColor, fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {s.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SEO Score Ring (sidebar-style widget) merged into bottom bar ── */}
        {/* ── Key Metrics Row ── */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.07)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Key Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 12 }}>
            {KEY_METRICS.map((m, i) => (
              <div key={i} style={{ borderRight: i < KEY_METRICS.length - 1 ? '1px solid #F3F4F6' : undefined, paddingRight: i < KEY_METRICS.length - 1 ? 12 : 0 }}>
                <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 4px' }}>{m.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{m.value}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  {m.up ? <ArrowUpRight size={12} color="#10B981" /> : <ArrowDownRight size={12} color="#EF4444" />}
                  <span style={{ fontSize: 11, fontWeight: 600, color: m.up ? '#10B981' : '#EF4444' }}>{m.change}%</span>
                </div>
                <Sparkline data={m.spark} color={m.color} up={m.up} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Fixed SEO Score Badge (bottom-left style) ── */}

    </div>
  );
};

export default SeoGmbPage;
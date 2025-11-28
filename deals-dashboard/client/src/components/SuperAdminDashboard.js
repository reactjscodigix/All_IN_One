import React from 'react';
import Chart from 'react-apexcharts';
import { ChevronDown } from 'lucide-react';

const SuperAdminDashboard = () => {

  const statCards = [
    {
      title: 'Total Companies',
      value: '5468',
      change: '+5.62%',
      trend: 'up',
      from: 'from last month',
      borderColor: '#FF6A59',
      backgroundColor: '#FFFCFB',
      icon: '📦',
      circleColor: '#FFE5E0'
    },
    {
      title: 'Active Companies',
      value: '4598',
      change: '+12%',
      trend: 'up',
      from: 'from last month',
      borderColor: '#2ED573',
      backgroundColor: '#F9FFFC',
      icon: '✓',
      circleColor: '#D4F9E8'
    },
    {
      title: 'Total Subscribers',
      value: '5468',
      change: '+6%',
      trend: 'up',
      from: 'from last month',
      borderColor: '#FFC107',
      backgroundColor: '#FFFEF5',
      icon: '👥',
      circleColor: '#FFE8B3'
    },
    {
      title: 'Total Earnings',
      value: '$89,878.58',
      change: '+16%',
      trend: 'up',
      from: 'from last month',
      borderColor: '#FF6A59',
      backgroundColor: '#FFFCFB',
      icon: '💵',
      circleColor: '#FFE5E0'
    }
  ];

  const companiesChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: "'Poppins', sans-serif",
      sparkline: { enabled: false }
    },
    colors: ['#FF6A59'],
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 3,
        distributed: false
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { 
        style: { 
          fontSize: '11px',
          fontFamily: "'Poppins', sans-serif",
          color: '#9CA3AF'
        }
      }
    },
    yaxis: {
      show: false,
      labels: { show: false }
    },
    grid: { 
      show: true,
      borderColor: '#E5E7EB',
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    tooltip: { 
      theme: 'light',
      style: { fontSize: '12px' }
    },
    states: {
      hover: { filter: { type: 'none' } }
    }
  };

  const companiesChartSeries = [
    {
      name: 'Companies',
      data: [30, 40, 20, 50, 60, 40, 50]
    }
  ];

  const revenueChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: "'Poppins', sans-serif",
      sparkline: { enabled: false }
    },
    colors: ['#FF6A59'],
    plotOptions: {
      bar: {
        columnWidth: '55%',
        borderRadius: 3,
        distributed: false
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { 
        style: { 
          fontSize: '10px',
          fontFamily: "'Poppins', sans-serif",
          color: '#9CA3AF'
        }
      }
    },
    yaxis: {
      show: true,
      labels: {
        formatter: (val) => `${Math.round(val / 1000)}k`,
        style: {
          fontSize: '10px',
          fontFamily: "'Poppins', sans-serif",
          color: '#9CA3AF'
        }
      }
    },
    grid: { 
      show: true,
      borderColor: '#F3F4F6',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    tooltip: { 
      theme: 'light',
      y: { formatter: (val) => `$${Math.round(val / 1000)}k` }
    }
  };

  const revenueChartSeries = [
    {
      name: 'Revenue',
      data: [40000, 20000, 50000, 45000, 80000, 75000, 80000, 78000, 85000, 20000, 75000, 60000]
    }
  ];

  const topPlansOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
      fontFamily: "'Poppins', sans-serif"
    },
    labels: ['Basic', 'Premium', 'Enterprise'],
    colors: ['#0D6EFD', '#FFC107', '#FF6A59'],
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: false
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { 
      enabled: true,
      theme: 'light'
    },
    states: {
      hover: {
        filter: { type: 'none' }
      }
    }
  };

  const topPlansSeries = [60, 20, 20];

  const recentTransactions = [
    { id: 1, company: 'NovaWave LLC', date: '14 Sep 2025', amount: '+$245', plan: 'Basic (Monthly)', avatar: '🌊' },
    { id: 2, company: 'BlueSky', date: '20 Mar 2025', amount: '+$395', plan: 'Enterprise (Yearly)', avatar: '☁️' },
    { id: 3, company: 'Silver Hawk', date: '26 Mar 2025', amount: '+$145', plan: 'Advanced (Monthly)', avatar: '🦅' },
    { id: 4, company: 'Summit Peak', date: '10 Feb 2025', amount: '+$758', plan: 'Enterprise (Monthly)', avatar: '⛰️' },
    { id: 5, company: 'RiverStone Ltd', date: '10 Jan 2025', amount: '+$977', plan: 'Premium (Yearly)', avatar: '🏞️' }
  ];

  const recentlyRegistered = [
    { id: 1, company: 'Bright Bridge Grp', plan: 'Basic (Monthly)', users: '150 Users', email: 'bbg@example.com', avatar: '🌉' },
    { id: 2, company: 'CoastalStar Co.', plan: '2Enterprise (Yearly)', users: '200 Users', email: 'csc@example.com', avatar: '⭐' },
    { id: 3, company: 'HarborView', plan: 'Advanced (Monthly)', users: '129 Users', email: 'hv@example.com', avatar: '🏖️' },
    { id: 4, company: 'Golden Gate Ltd', plan: 'Enterprise (Monthly)', users: '103 Users', email: 'ggl@example.com', avatar: '🚪' },
    { id: 5, company: 'Redwood Inc', plan: 'Premium (Yearly)', users: '109 Users', email: 'rw@example.com', avatar: '🌲' }
  ];

  const recentlyExpired = [
    { id: 1, company: 'VK Pvt Ltd', date: '14 Sep 2025', plan: 'Basic (Monthly)', avatar: '📱' },
    { id: 2, company: 'RiverStone Ltd', date: '20 Mar 2025', plan: 'Enterprise (Yearly)', avatar: '🏞️' },
    { id: 3, company: 'Summit Peak', date: '26 Mar 2025', plan: 'Advanced (Monthly)', avatar: '⛰️' },
    { id: 4, company: 'Redwood Inc', date: '10 Feb 2025', plan: 'Enterprise (Monthly)', avatar: '🌲' },
    { id: 5, company: 'NovaWave LLC', date: '10 Jan 2025', plan: 'Premium (Yearly)', avatar: '🌊' }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F6FB' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '13px', color: '#6B7280' }}>28 Nov 25 - 28 Nov 25</span>
              <button style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#FFF', cursor: 'pointer', fontSize: '13px' }}>
                ↻
              </button>
            </div>
          </div>

          {/* Welcome Banner */}
          <div style={{ backgroundColor: '#1F2937', color: '#FFF', borderRadius: '8px', padding: '32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
            <div className="flex items-start justify-between">
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', fontFamily: "'Poppins', sans-serif" }}>
                  Welcome Back, Adrian
                </h2>
                <p style={{ fontSize: '14px', color: '#D1D5DB', fontFamily: "'Poppins', sans-serif" }}>
                  14 New Companies Subscribed Today !!!
                </p>
              </div>
              <div className="flex gap-2">
                <button style={{ padding: '8px 16px', backgroundColor: '#FF6A59', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: "'Poppins', sans-serif" }}>
                  Companies
                </button>
                <button style={{ padding: '8px 16px', backgroundColor: '#FFF', color: '#1F2937', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: "'Poppins', sans-serif" }}>
                  All Packages
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: card.backgroundColor,
                  border: `1px solid #E5E7EB`,
                  borderLeft: `4px solid ${card.borderColor}`,
                  borderRadius: '8px',
                  padding: '20px',
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px', fontFamily: "'Poppins', sans-serif", fontWeight: '500' }}>
                      {card.title}
                    </p>
                    <h3 style={{ fontSize: '26px', fontWeight: '700', color: '#1F2937', marginBottom: '8px', fontFamily: "'Poppins', sans-serif" }}>
                      {card.value}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10B981', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
                      <span>📈</span>
                      <span>{card.change}</span>
                      <span style={{ color: '#6B7280', fontWeight: '400' }}>{card.from}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: card.circleColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Companies Chart */}
            <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                  Companies
                </h3>
                <button style={{ fontSize: '12px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Poppins', sans-serif", fontWeight: '500' }}>
                  This Week <ChevronDown size={16} />
                </button>
              </div>
              <div style={{ height: '240px' }}>
                <Chart
                  options={companiesChartOptions}
                  series={companiesChartSeries}
                  type="bar"
                  height="100%"
                />
              </div>
              <div style={{ marginTop: '12px', fontSize: '11px', color: '#10B981', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
                📈 <span>12.5%</span> <span style={{ color: '#6B7280', fontWeight: '400' }}>from last month</span>
              </div>
            </div>

            {/* Revenue Chart */}
            <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} className="lg:col-span-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', marginBottom: '10px', fontFamily: "'Poppins', sans-serif" }}>
                    Revenue
                  </h3>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: '#1F2937', marginBottom: '4px', fontFamily: "'Poppins', sans-serif" }}>
                    $89,878.58
                  </p>
                  <div style={{ fontSize: '11px', color: '#10B981', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
                    📈 <span>40%</span> <span style={{ color: '#6B7280', fontWeight: '400' }}>increased from last year</span>
                  </div>
                </div>
                <button style={{ fontSize: '12px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Poppins', sans-serif", fontWeight: '500' }}>
                  2025 <ChevronDown size={16} />
                </button>
              </div>
              <div style={{ height: '240px' }}>
                <Chart
                  options={revenueChartOptions}
                  series={revenueChartSeries}
                  type="bar"
                  height="100%"
                />
              </div>
            </div>

            {/* Top Plans Chart */}
            <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                  Top Plans
                </h3>
                <button style={{ fontSize: '12px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Poppins', sans-serif", fontWeight: '500' }}>
                  Last 30 Days <ChevronDown size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '240px' }}>
                <div style={{ height: '180px', width: '100%', maxWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Chart
                    options={topPlansOptions}
                    series={topPlansSeries}
                    type="donut"
                    height="100%"
                  />
                </div>
                <div style={{ marginTop: '16px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#0D6EFD' }}></div>
                      <span style={{ fontSize: '12px', color: '#374151', fontFamily: "'Poppins', sans-serif", fontWeight: '500' }}>Basic</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>60%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FFC107' }}></div>
                      <span style={{ fontSize: '12px', color: '#374151', fontFamily: "'Poppins', sans-serif", fontWeight: '500' }}>Premium</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>20%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FF6A59' }}></div>
                      <span style={{ fontSize: '12px', color: '#374151', fontFamily: "'Poppins', sans-serif", fontWeight: '500' }}>Enterprise</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ marginTop: '32px', marginBottom: '32px' }}>
            {/* Recent Transactions */}
            <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                  Recent Transactions
                </h3>
                <button style={{ fontSize: '11px', fontWeight: '700', color: '#FFF', backgroundColor: '#FF6A59', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {recentTransactions.map((tx) => (
                  <div key={tx.id} style={{ paddingBottom: '16px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0
                      }}
                    >
                      {tx.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '2px', fontFamily: "'Poppins', sans-serif" }}>
                        {tx.company}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '2px', fontFamily: "'Poppins', sans-serif" }}>
                        {tx.date}
                      </p>
                      <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>
                        {tx.plan}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                        {tx.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Registered */}
            <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                  Recently Registered
                </h3>
                <button style={{ fontSize: '11px', fontWeight: '700', color: '#FFF', backgroundColor: '#FF6A59', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {recentlyRegistered.map((reg) => (
                  <div key={reg.id} style={{ paddingBottom: '16px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0
                      }}
                    >
                      {reg.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '2px', fontFamily: "'Poppins', sans-serif" }}>
                        {reg.company}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px', fontFamily: "'Poppins', sans-serif" }}>
                        {reg.plan}
                      </p>
                      <p style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px', fontFamily: "'Poppins', sans-serif" }}>
                        {reg.users}
                      </p>
                      <p style={{ fontSize: '11px', color: '#0D6EFD', fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>
                        {reg.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Plan Expired */}
            <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                  Recently Plan Expired
                </h3>
                <button style={{ fontSize: '11px', fontWeight: '700', color: '#FFF', backgroundColor: '#FF6A59', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {recentlyExpired.map((exp) => (
                  <div key={exp.id} style={{ paddingBottom: '16px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '12px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          flexShrink: 0
                        }}
                      >
                        {exp.avatar}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '2px', fontFamily: "'Poppins', sans-serif" }}>
                          {exp.company}
                        </h4>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '2px', fontFamily: "'Poppins', sans-serif" }}>
                          {exp.date}
                        </p>
                        <p style={{ fontSize: '11px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>
                          {exp.plan}
                        </p>
                      </div>
                    </div>
                    <button style={{ fontSize: '11px', fontWeight: '700', color: '#0D6EFD', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>
                      Send Reminder
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF', fontFamily: "'Poppins', sans-serif" }}>
            <p>Copyright © 2025 <span style={{ color: '#FF6A59' }}>Preadmin</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

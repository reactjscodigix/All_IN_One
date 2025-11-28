import React, { useState } from 'react';
import { ChevronDown, MoreVertical, Search } from 'lucide-react';
import domainsData from '../data/domainsData.json';

const Domain = () => {
  const [starred, setStarred] = useState({});

  const toggleStar = (id) => {
    setStarred(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return { bg: '#28C76F', color: '#FFF' };
    if (status === 'Pending') return { bg: '#1890FF', color: '#FFF' };
    return { bg: '#F62416', color: '#FFF' };
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA502', '#6C5CE7', '#A29BFE', '#00B894', '#FDCB6E'];
  const getAvatarColor = (id) => colors[id % colors.length];

  return (
    <div style={{ backgroundColor: '#F5F6FB', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif", margin: 0 }}>
              Domains
            </h1>
            <div style={{ backgroundColor: '#FF6A59', color: '#FFF', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', fontWeight: '700', fontFamily: "'Poppins', sans-serif" }}>
              {domainsData.count}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>
            <span>Home</span> <span style={{ margin: '0 8px' }}>/</span> <span>Domains</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input 
                type="text" 
                placeholder="Search" 
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px', fontFamily: "'Poppins', sans-serif", color: '#1F2937' }}
              />
            </div>
          </div>
          <button style={{ fontSize: '13px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Poppins', sans-serif", fontWeight: '500' }}>
            Filter <ChevronDown size={16} />
          </button>
          <div style={{ fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>28 Nov 25 - 28 Nov 25</div>
          <button style={{ fontSize: '13px', color: '#FFF', backgroundColor: '#FF6A59', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
            Add New
          </button>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                  </th>
                  <th style={{ padding: '16px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif", width: '40px' }}></th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Name</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Domain URL</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Plan</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Created Date</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Status</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {domainsData.domains.map((domain) => {
                  const statusColor = getStatusColor(domain.status);
                  return (
                    <tr key={domain.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 12px', textAlign: 'left' }}>
                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                        <span 
                          onClick={() => toggleStar(domain.id)} 
                          style={{ fontSize: '16px', cursor: 'pointer', display: 'inline-block', color: starred[domain.id] ? '#FFC107' : '#D1D5DB' }}
                        >
                          {starred[domain.id] ? '★' : '☆'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: getAvatarColor(domain.id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                          {getInitials(domain.name)}
                        </div>
                        <span>{domain.name}</span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>{domain.domainUrl}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>{domain.plan}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>{domain.createdDate}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'left' }}>
                        <span style={{ backgroundColor: statusColor.bg, color: statusColor.color, padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', fontFamily: "'Poppins', sans-serif", display: 'inline-block' }}>
                          {domain.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px', transition: 'color 0.2s' }}>
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF', fontFamily: "'Poppins', sans-serif", paddingBottom: '24px' }}>
          <p style={{ margin: 0 }}>Copyright © 2025 <span style={{ color: '#FF6A59', fontWeight: '600' }}>Preadmin</span></p>
        </div>
      </div>
    </div>
  );
};

export default Domain;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MoreVertical, Search, Download, Settings, X } from 'lucide-react';
import AddNewCompanyPlanModal from './AddNewCompanyPlanModal';
import { plansAPI } from '../services/api';

const Packages = () => {
  const navigate = useNavigate();
  const [starred, setStarred] = useState({});
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [exportDropOpen, setExportDropOpen] = useState(false);
  const [sortDropOpen, setSortDropOpen] = useState(false);
  const [filterDropOpen, setFilterDropOpen] = useState(false);
  const [dateDropOpen, setDateDropOpen] = useState(false);
  const [manageColsOpen, setManageColsOpen] = useState(false);
  const [selectedDate] = useState('1 Dec 25 - 1 Dec 25');
  const [columnVisibility, setColumnVisibility] = useState({
    planName: true,
    planType: true,
    totalSubscribers: true,
    price: true,
    createdDate: true,
    status: true,
    action: true
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: '', type: '', show: false }), 3000);
  }, []);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await plansAPI.getAll();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      showToast('Failed to fetch plans', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const toggleStar = (id) => {
    setStarred(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddPlanSubmit = async (formData) => {
    try {
      await plansAPI.create(formData);
      await fetchPlans();
      setIsAddPlanModalOpen(false);
      showToast('Plan created successfully!', 'success');
    } catch (error) {
      console.error('Failed to add plan:', error);
      showToast('Failed to create plan. Please try again.', 'error');
    }
  };

  return (
    <div style={{ backgroundColor: '#F5F6FB', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Toast Notification */}
        {toast.show && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            backgroundColor: toast.type === 'success' ? '#28C76F' : '#FF6A59',
            color: '#FFF',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: "'Poppins', sans-serif",
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif", margin: 0 }}>
                Packages
              </h1>
              <div style={{ backgroundColor: '#FFE5E5', color: '#F62416', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', fontWeight: '700', fontFamily: "'Poppins', sans-serif" }}>
                {plans.length}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#475467', fontFamily: "'Poppins', sans-serif", display: 'flex', gap: '8px' }}>
              <span style={{ color: '#FF6A59', fontWeight: '500', cursor: 'pointer' }}>Home</span> 
              <span>/</span> 
              <span>Packages</span>
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Export Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExportDropOpen(!exportDropOpen)}
                style={{ fontSize: '13px', color: '#475467', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F9FAFB'}
              >
                <Download size={16} />
                Export <ChevronDown size={16} />
              </button>
              {exportDropOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, minWidth: '200px' }}>
                  <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                    <Download size={14} /> Export as PDF
                  </button>
                  <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", borderTop: '1px solid #E5E7EB', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                    <Download size={14} /> Export as Excel
                  </button>
                </div>
              )}
            </div>

            <button style={{ fontSize: '13px', color: '#475467', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'} onMouseLeave={(e) => e.target.style.backgroundColor = '#F9FAFB'}>
              🔄
            </button>

            {/* Manage Columns Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setManageColsOpen(!manageColsOpen)}
                style={{ fontSize: '13px', color: '#475467', backgroundColor: '#EEF5FF', border: '1px solid #D1E0FF', borderRadius: '6px', padding: '10px 16px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E0EBFF'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#EEF5FF'}
              >
                <Settings size={16} />
                Manage Columns
              </button>
              {manageColsOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, minWidth: '240px', padding: '12px 0' }}>
                  {Object.keys(columnVisibility).map((col) => (
                    <button
                      key={col}
                      onClick={() => setColumnVisibility(prev => ({ ...prev, [col]: !prev[col] }))}
                      style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>≡</span>
                        {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                      </span>
                      <div style={{ width: '32px', height: '18px', borderRadius: '9px', backgroundColor: columnVisibility[col] ? '#FF5B5B' : '#D1D5DB', transition: 'all 0.2s', display: 'flex', alignItems: 'center', padding: '2px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#FFF', marginLeft: columnVisibility[col] ? '14px' : '0px', transition: 'margin-left 0.2s' }} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', maxWidth: '360px', flex: '0 0 auto' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input 
              type="text" 
              placeholder="Search" 
              style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', fontFamily: "'Poppins', sans-serif", color: '#1F2937', height: '44px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Filter Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterDropOpen(!filterDropOpen)}
              style={{ fontSize: '13px', color: '#475467', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '12px 14px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', height: '44px' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#F9FAFB'}
            >
              <span>Filter</span> <ChevronDown size={16} />
            </button>
            {filterDropOpen && (
              <div style={{ position: 'absolute', left: 0, top: '100%', marginTop: '8px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, minWidth: '200px' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937' }}>Filters</span>
                  <button onClick={() => setFilterDropOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                    <X size={16} />
                  </button>
                </div>
                <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  By Status
                </button>
                <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", borderTop: '1px solid #E5E7EB', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  By Plan Type
                </button>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDateDropOpen(!dateDropOpen)}
              style={{ fontSize: '13px', color: '#475467', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '12px 14px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', height: '44px' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#F9FAFB'}
            >
              📅 {selectedDate}
            </button>
            {dateDropOpen && (
              <div style={{ position: 'absolute', left: 0, top: '100%', marginTop: '8px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, minWidth: '200px', padding: '8px' }}>
                <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '12px', fontFamily: "'Poppins', sans-serif" }} />
              </div>
            )}
          </div>

          {/* Sort By Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSortDropOpen(!sortDropOpen)}
              style={{ fontSize: '13px', color: '#475467', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '12px 14px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', height: '44px' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#F9FAFB'}
            >
              <span>Sort By</span> <ChevronDown size={16} />
            </button>
            {sortDropOpen && (
              <div style={{ position: 'absolute', left: 0, top: '100%', marginTop: '8px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 50, minWidth: '180px' }}>
                <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  Newest First
                </button>
                <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", borderTop: '1px solid #E5E7EB', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  Oldest First
                </button>
                <button style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", borderTop: '1px solid #E5E7EB', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  Price: High to Low
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsAddPlanModalOpen(true)}
            style={{ fontSize: '13px', color: '#FFF', backgroundColor: '#FF6A59', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '600', marginLeft: 'auto' }}>
            Add New Plan
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
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Plan Name</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Plan Type</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Total Subscribers</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Price</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Created Date</th>
                  <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Status</th>
                  <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '40px 12px', textAlign: 'center', fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>
                      Loading plans...
                    </td>
                  </tr>
                ) : plans.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '40px 12px', textAlign: 'center', fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>
                      No plans found. Click "Add New" to create one.
                    </td>
                  </tr>
                ) : (
                  plans.map((pkg) => (
                    <tr key={pkg.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 12px', textAlign: 'left' }}>
                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                        <span 
                          onClick={() => toggleStar(pkg.id)} 
                          style={{ fontSize: '16px', cursor: 'pointer', display: 'inline-block', color: starred[pkg.id] ? '#FFC107' : '#D1D5DB' }}
                        >
                          {starred[pkg.id] ? '★' : '☆'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
                        {pkg.plan_name}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>{pkg.plan_type}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>0</td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
                        {pkg.plan_currency || 'N/A'}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>
                        {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'left' }}>
                        <span style={{ backgroundColor: pkg.status === 'Active' ? '#28C76F' : '#FF6A59', color: '#FFF', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', fontFamily: "'Poppins', sans-serif", display: 'inline-block' }}>
                          {pkg.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => setOpenActionMenu(openActionMenu === pkg.id ? null : pkg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px', transition: 'color 0.2s' }}>
                          <MoreVertical size={18} />
                        </button>
                        {openActionMenu === pkg.id && (
                          <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '180px' }}>
                            <button onClick={() => { navigate('/super-admin-subscriptions'); setOpenActionMenu(null); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1F2937', fontFamily: "'Poppins', sans-serif", transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                              <span>📋</span> View Subscriptions
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#9CA3AF', fontFamily: "'Poppins', sans-serif", paddingBottom: '24px' }}>
          <p style={{ margin: 0 }}>Copyright © 2025 <span style={{ color: '#FF6A59', fontWeight: '600' }}>Preadmin</span></p>
        </div>
      </div>

      {/* Add New Company Plan Modal */}
      <AddNewCompanyPlanModal
        isOpen={isAddPlanModalOpen}
        onClose={() => setIsAddPlanModalOpen(false)}
        onSubmit={handleAddPlanSubmit}
      />
    </div>
  );
};

export default Packages;

import React, { useState, useEffect } from 'react';
import { ChevronDown, MoreVertical, Search } from 'lucide-react';
import packagesData from '../data/packagesData.json';
import AddNewCompanyPlanModal from './AddNewCompanyPlanModal';
import { plansAPI } from '../services/api';

const Packages = () => {
  const [starred, setStarred] = useState({});
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', show: false });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
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
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: '', type: '', show: false }), 3000);
  };

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
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1F2937', fontFamily: "'Poppins', sans-serif", margin: 0 }}>
              Packages
            </h1>
            <div style={{ backgroundColor: '#FF6A59', color: '#FFF', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', fontWeight: '700', fontFamily: "'Poppins', sans-serif" }}>
              {plans.length}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280', fontFamily: "'Poppins', sans-serif" }}>
            <span>Home</span> <span style={{ margin: '0 8px' }}>/</span> <span>Packages</span>
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
          <button 
            onClick={() => setIsAddPlanModalOpen(true)}
            style={{ fontSize: '13px', color: '#FFF', backgroundColor: '#FF6A59', border: 'none', borderRadius: '6px', padding: '10px 18px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
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
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px', transition: 'color 0.2s' }}>
                          <MoreVertical size={18} />
                        </button>
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

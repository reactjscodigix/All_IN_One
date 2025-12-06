import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import dealsData from '../data/crmDealsData.json';
import AddNewDealModal from './AddNewDealModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { dealsAPI, contactsAPI, companiesAPI, projectAPI } from '../services/api';
import projectsData from '../data/crmProjectsData.json';

const CrmDealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [stageStats, setStageStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedDealToEdit, setSelectedDealToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, deal: null, isDeleting: false });
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dealsRes, contactsRes, companiesRes, projectsRes] = await Promise.all([
          dealsAPI.getAll(),
          contactsAPI.getAll(),
          companiesAPI.getAll(),
          projectAPI.getAll(),
        ]);
        
        console.log('✅ API Response - Deals:', dealsRes);
        console.log('✅ API Response - Projects:', projectsRes);
        
        if (dealsRes && Array.isArray(dealsRes) && dealsRes.length > 0) {
          const formattedDeals = dealsRes.map(deal => {
            const stage = deal.pipeline || deal.deal_stage || 'Unclassified';
            return {
              ...deal,
              id: deal.id,
              stage: stage,
              company: deal.company_name || deal.deal_name || 'Unknown Company',
              initials: ((deal.company_name || deal.deal_name || 'UC').substring(0, 2)).toUpperCase(),
              value: parseFloat(deal.deal_value) || 0,
              email: deal.email || 'contact@example.com',
              phone: deal.phone || '+1 (555) 000-0000',
              location: deal.location || 'Unknown',
              owner: deal.assignee_first_name && deal.assignee_last_name 
                ? `${deal.assignee_first_name} ${deal.assignee_last_name}` 
                : deal.first_name && deal.last_name 
                ? `${deal.first_name} ${deal.last_name}`
                : 'Unassigned',
              ownerImage: 'avatar-1',
              progress: deal.probability || 10,
              date: deal.follow_up_date 
                ? new Date(deal.follow_up_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) 
                : deal.due_date 
                ? new Date(deal.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            };
          });
          
          console.log('✅ Formatted Deals:', formattedDeals);
          
          const allowedStages = [
            'New',
            'Discovery',
            'Proposal Sent',
            'Negotiation',
            'Qualified To Buy',
            'Inpipeline',
            'Follow Up',
            'Conversation'
          ];
          
          const updatedStats = allowedStages.map(stage => {
            const stageDeals = formattedDeals.filter(d => d.stage === stage);
            return {
              stage,
              leads: stageDeals.length,
              value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
            };
          });
          
          console.log('✅ Updated Stage Stats:', updatedStats);
          
          setDeals(formattedDeals);
          setStageStats(updatedStats);
        } else {
          console.warn('⚠️ No deals received or invalid format, using fallback data');
          const allowedStages = [
            'New',
            'Discovery',
            'Proposal Sent',
            'Negotiation',
            'Qualified To Buy',
            'Inpipeline',
            'Follow Up',
            'Conversation'
          ];
          const filteredStats = dealsData.stageStats.filter(stat => allowedStages.includes(stat.stage));
          setDeals(dealsData.deals);
          setStageStats(filteredStats);
        }
        
        setContacts(contactsRes || []);
        setCompanies(companiesRes || []);
        setProjects(projectsRes && Array.isArray(projectsRes) ? projectsRes : projectsData.projects || []);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        const allowedStages = [
          'New',
          'Discovery',
          'Proposal Sent',
          'Negotiation',
          'Qualified To Buy',
          'Inpipeline',
          'Follow Up',
          'Conversation'
        ];
        const filteredStats = dealsData.stageStats.filter(stat => allowedStages.includes(stat.stage));
        setDeals(dealsData.deals);
        setStageStats(filteredStats);
        setProjects(projectsData.projects || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-100 text-green-700';
    if (progress >= 50) return 'bg-blue-100 text-blue-700';
    if (progress >= 25) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getInitialsBgColor = (initials) => {
    const colors = ['#10b981', '#ec4899', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];
    if (!initials) return colors[0];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleCreateDeal = async (formData) => {
    try {
      const response = await dealsAPI.create(formData);
      
      if (response.id) {
        const selectedCompany = companies.find(c => c.id === parseInt(formData.company_id));
        const selectedContact = contacts.find(c => c.id === parseInt(formData.contact_id));
        
        const companyName = selectedCompany?.company_name || selectedCompany?.name || formData.deal_name || 'New Deal';
        const initials = (companyName.substring(0, 2)).toUpperCase();
        
        const dealValue = parseFloat(formData.deal_value) || 0;
        const dealStage = formData.pipeline || 'Qualify To Buy';
        
        const newDeal = {
          id: response.id,
          stage: dealStage,
          company: companyName,
          initials: initials,
          value: dealValue,
          email: selectedContact?.email || 'contact@example.com',
          phone: selectedContact?.phone || '+1 (555) 000-0000',
          location: selectedContact?.location || 'Unknown',
          owner: selectedContact?.first_name && selectedContact?.last_name
            ? `${selectedContact.first_name} ${selectedContact.last_name}`
            : selectedContact?.name || 'Unassigned',
          ownerImage: 'avatar-1',
          progress: 10,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          deal_name: formData.deal_name,
          pipeline: formData.pipeline,
          status: formData.status,
          currency: formData.currency,
          priority: formData.priority,
          tags: formData.tags,
          created_at: new Date().toISOString(),
        };
        
        setDeals(prev => [newDeal, ...prev]);
        
        const existingStage = stageStats.find(stat => stat.stage === dealStage);
        if (existingStage) {
          setStageStats(prev => prev.map(stat => 
            stat.stage === dealStage 
              ? { ...stat, leads: stat.leads + 1, value: stat.value + dealValue }
              : stat
          ));
        } else {
          setStageStats(prev => [...prev, { stage: dealStage, leads: 1, value: dealValue }]);
        }
        
        setIsModalOpen(false);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to create deal');
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 420;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleEditDeal = (deal) => {
    setSelectedDealToEdit(deal);
    setIsEditModalOpen(true);
    setOpenMenu(null);
  };

  const handleDeleteDeal = (deal) => {
    setDeleteConfirm({ isOpen: true, deal, isDeleting: false });
    setOpenMenu(null);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
      await dealsAPI.delete(deleteConfirm.deal.id);
      setDeals(prev => prev.filter(d => d.id !== deleteConfirm.deal.id));
      
      const updatedStats = stageStats.map(stat => ({
        ...stat,
        leads: stat.leads - (stat.stage === deleteConfirm.deal.stage ? 1 : 0),
        value: stat.value - (stat.stage === deleteConfirm.deal.stage ? deleteConfirm.deal.value : 0)
      }));
      setStageStats(updatedStats);
      
      setDeleteConfirm({ isOpen: false, deal: null, isDeleting: false });
    } catch (err) {
      console.error('Failed to delete deal:', err);
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleUpdateDeal = async (formData) => {
    try {
      await dealsAPI.update(selectedDealToEdit.id, formData);
      
      const updatedDeal = {
        ...selectedDealToEdit,
        ...formData,
        stage: formData.pipeline || selectedDealToEdit.stage,
        value: parseFloat(formData.deal_value) || selectedDealToEdit.value,
        company: formData.company_name || selectedDealToEdit.company,
      };
      
      setDeals(prev => prev.map(d => d.id === selectedDealToEdit.id ? updatedDeal : d));
      
      const oldStage = selectedDealToEdit.stage;
      const newStage = formData.pipeline || oldStage;
      const oldValue = selectedDealToEdit.value;
      const newValue = parseFloat(formData.deal_value) || selectedDealToEdit.value;
      
      if (oldStage !== newStage) {
        setStageStats(prev => prev.map(stat => {
          let newStat = { ...stat };
          if (stat.stage === oldStage) {
            newStat.leads = Math.max(0, newStat.leads - 1);
            newStat.value = newStat.value - oldValue;
          }
          if (stat.stage === newStage) {
            newStat.leads = newStat.leads + 1;
            newStat.value = newStat.value + newValue;
          }
          return newStat;
        }));
      } else {
        setStageStats(prev => prev.map(stat =>
          stat.stage === oldStage
            ? { ...stat, value: stat.value - oldValue + newValue }
            : stat
        ));
      }
      
      setIsEditModalOpen(false);
      setSelectedDealToEdit(null);
    } catch (err) {
      throw new Error(err.message || 'Failed to update deal');
    }
  };

  const groupedDeals = stageStats.map(stageStat => ({
    ...stageStat,
    deals: deals.filter(d => d.stage === stageStat.stage)
  }));
  
  const hasAnyDeals = deals.length > 0;
  console.log('📊 Grouped Deals:', groupedDeals);
  console.log('📊 Has Any Deals:', hasAnyDeals);
  console.log('📊 Total Groups:', groupedDeals.length);
  console.log('📊 Total Deals:', deals.length);

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px] font-bold text-gray-900">Deals</h1>
              <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-[12px] font-bold">125</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] mt-1">
              <button className="text-orange-500 hover:text-orange-600 font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Deals</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white flex items-center gap-2">
              <Download size={16} /> Export
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition text-[13px]">
              Add Deal
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-[13px] bg-white"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white flex items-center gap-2">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-0 relative overflow-hidden">
        <div className="relative group h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">Loading deals...</p>
              </div>
            </div>
          ) : !hasAnyDeals ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No deals found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or add a new deal</p>
              </div>
            </div>
          ) : (
          <div
            ref={scrollRef}
            className="flex gap-6 h-full overflow-x-auto overflow-y-auto pr-2 pb-4"
          >
            {groupedDeals.map((group) => (
              <div key={group.stage} className="flex-shrink-0 w-96">
                <div className="sticky top-0 bg-gray-50 mb-4 pt-0 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <h2 className="text-[15px] font-bold text-gray-900">{group.stage}</h2>
                      </div>
                      <p className="text-[12px] text-gray-600 mt-1">{group.deals.length} Deals - {formatCurrency(group.value)}</p>
                    </div>
                    <button className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-md transition">
                      <MoreVertical size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {group.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-3.5 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex-shrink-0 relative"
                      onClick={() => openMenu === deal.id && setOpenMenu(null)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: getInitialsBgColor(deal.initials || deal.company) }}
                        >
                          {deal.initials || deal.company?.substring(0, 2).toUpperCase() || 'N/A'}
                        </div>
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenu(openMenu === deal.id ? null : deal.id)}
                            className="text-gray-400 hover:bg-gray-100 p-1 rounded-md transition"
                          >
                            <MoreVertical size={14} strokeWidth={1.5} />
                          </button>
                          {openMenu === deal.id && (
                            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-32">
                              <button
                                onClick={() => handleEditDeal(deal)}
                                className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDeal(deal)}
                                className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 last:rounded-b-lg flex items-center gap-2"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-[13px] font-semibold text-gray-900 mb-2 line-clamp-2">{deal.company}</h3>

                      <div className="space-y-1.5 mb-3 text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">💰</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">✉️</span>
                          <span className="text-gray-600 truncate text-[11px]">{deal.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📞</span>
                          <span className="text-gray-600 text-[11px]">{deal.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📍</span>
                          <span className="text-gray-600 text-[11px]">{deal.location}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold"></div>
                          <span className="text-[11px] text-gray-700 flex-1 truncate">{deal.owner}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${getProgressColor(deal.progress)}`}>
                            {deal.progress}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>📅 {deal.date}</span>
                        <div className="flex gap-1.5">
                          <button className="text-gray-400 hover:text-gray-600">✉️</button>
                          <button className="text-gray-400 hover:text-gray-600">📞</button>
                          <button className="text-gray-400 hover:text-gray-600">💬</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          )}

          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:shadow-lg hover:bg-gray-50 transition opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:shadow-lg hover:bg-gray-50 transition opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white text-center">
        <p className="text-[12px] text-gray-500 font-medium">Copyright © 2025 <span className="text-red-600 font-semibold">Preadmin</span></p>
      </div>

      <AddNewDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDeal}
        contacts={contacts}
        companies={companies}
        projects={projects}
      />

      <AddNewDealModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDealToEdit(null);
        }}
        onSubmit={handleUpdateDeal}
        contacts={contacts}
        companies={companies}
        projects={projects}
        dealToEdit={selectedDealToEdit}
      />

      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, deal: null, isDeleting: false })}
        userName={deleteConfirm.deal?.company || 'this deal'}
        isDeleting={deleteConfirm.isDeleting}
      />
    </div>
  );
};

export default CrmDealsPage;

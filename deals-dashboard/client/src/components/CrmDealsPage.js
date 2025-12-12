import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import dealsData from '../data/crmDealsData.json';
import AddNewDealModal from './AddNewDealModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { dealsAPI, contactsAPI, companiesAPI, projectAPI } from '../services/api';
import projectsData from '../data/crmProjectsData.json';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const PIPELINE_STAGE_ORDER = [
  'New',
  'Discovery',
  'Follow Up',
  'Inpipeline',
  'Conversation',
  'Proposal Sent',
  'Negotiation',
  'Qualified To Buy',
  'Won',
  'Lost'
];

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
        
        console.log('✅ API Response - Deals (raw):', dealsRes);
        console.log('✅ API Response - Deals type:', typeof dealsRes);
        console.log('✅ API Response - Deals is Array:', Array.isArray(dealsRes));
        console.log('✅ API Response - Deals keys:', dealsRes ? Object.keys(dealsRes).slice(0, 10) : 'N/A');
        console.log('✅ API Response - Projects:', projectsRes);
        
        let actualDeals = dealsRes;
        if (dealsRes && !Array.isArray(dealsRes) && typeof dealsRes === 'object') {
          console.log('⚠️ API response is not an array, attempting to unwrap...');
          if (dealsRes.data && Array.isArray(dealsRes.data)) {
            actualDeals = dealsRes.data;
            console.log('✅ Unwrapped deals from dealsRes.data');
          } else if (dealsRes.deals && Array.isArray(dealsRes.deals)) {
            actualDeals = dealsRes.deals;
            console.log('✅ Unwrapped deals from dealsRes.deals');
          } else if (dealsRes.rows && Array.isArray(dealsRes.rows)) {
            actualDeals = dealsRes.rows;
            console.log('✅ Unwrapped deals from dealsRes.rows');
          } else {
            console.warn('⚠️ Cannot find array property in API response, will use fallback');
            actualDeals = [];
          }
        }
        
        console.log('📊 actualDeals after unwrapping:', actualDeals);
        console.log('📊 actualDeals is array:', Array.isArray(actualDeals));
        console.log('📊 actualDeals.length:', actualDeals?.length);
        
        if (actualDeals && Array.isArray(actualDeals) && actualDeals.length > 0) {
          const getProbabilityFromPipeline = (pipeline, status) => {
            const statusProbabilityMap = {
              'Won': 100,
              'Lost': 0
            };
            
            if (statusProbabilityMap[status] !== undefined) {
              return statusProbabilityMap[status];
            }

            const pipelineProbabilityMap = {
              'New': 10,
              'Discovery': 20,
              'Follow Up': 30,
              'Inpipeline': 40,
              'Conversation': 50,
              'Proposal Sent': 60,
              'Negotiation': 70,
              'Qualified To Buy': 80
            };
            return pipelineProbabilityMap[pipeline] || 10;
          };

          const formattedDeals = actualDeals.map(deal => {
            const stage = deal.pipeline || deal.deal_stage || 'Unclassified';
            const probability = getProbabilityFromPipeline(stage, deal.status);
            
            const formatted = {
              ...deal,
              id: deal.id,
              stage: stage,
              company: deal.company_name || deal.deal_name || 'Unknown Company',
              initials: ((deal.company_name || deal.deal_name || 'UC').substring(0, 2)).toUpperCase(),
              value: parseFloat(deal.deal_value) || 0,
              email: deal.contact_email || 'N/A',
              phone: deal.contact_phone || 'N/A',
              location: deal.contact_position || 'N/A',
              owner: deal.assignee_first_name && deal.assignee_last_name 
                ? `${deal.assignee_first_name} ${deal.assignee_last_name}` 
                : deal.contact_first_name && deal.contact_last_name 
                ? `${deal.contact_first_name} ${deal.contact_last_name}`
                : 'Unassigned',
              ownerImage: 'avatar-1',
              progress: probability,
              date: deal.follow_up_date 
                ? new Date(deal.follow_up_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) 
                : deal.due_date 
                ? new Date(deal.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            };
            
            if (!formatted.company_id && deal.company_id) {
              formatted.company_id = deal.company_id;
            }
            if (!formatted.contact_id && deal.contact_id) {
              formatted.contact_id = deal.contact_id;
            }
            if (!formatted.deal_name && deal.deal_name) {
              formatted.deal_name = deal.deal_name;
            }
            if (!formatted.currency && deal.currency) {
              formatted.currency = deal.currency;
            }
            
            console.log(`📋 Formatted deal ${deal.id} - company_id: ${formatted.company_id}, deal_name: ${formatted.deal_name}, probability: ${formatted.progress}, email: ${formatted.email}`);
            
            return formatted;
          });
          
          console.log('✅ Formatted Deals:', formattedDeals);
          console.log('📊 Unique stages in deals:', [...new Set(formattedDeals.map(d => d.stage))]);
          
          const uniqueStages = [...new Set(formattedDeals.map(d => d.stage))].filter(s => s && s !== 'Unclassified');
          console.log('📋 Unique stages from deals:', uniqueStages);
          
          const updatedStats = uniqueStages
            .map(stage => {
              const stageDeals = formattedDeals.filter(d => d.stage === stage);
              return {
                stage,
                leads: stageDeals.length,
                value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
              };
            })
            .sort((a, b) => {
              const indexA = PIPELINE_STAGE_ORDER.indexOf(a.stage);
              const indexB = PIPELINE_STAGE_ORDER.indexOf(b.stage);
              return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
          
          console.log('✅ Updated Stage Stats (sorted):', updatedStats);
          
          console.log('🔄 Setting deals state to:', formattedDeals.length, 'deals');
          setDeals(formattedDeals);
          setStageStats(updatedStats);
        } else {
          console.warn('⚠️ No deals received or invalid format, using fallback data');
          console.warn('actualDeals is:', actualDeals);
          console.warn('actualDeals.length:', actualDeals?.length);
          
          const fallbackDeals = dealsData.deals || [];
          const fallbackStages = [...new Set(fallbackDeals.map(d => d.stage))].filter(s => s && s !== 'Unclassified');
          const fallbackStats = fallbackStages
            .map(stage => {
              const stageDealsList = fallbackDeals.filter(d => d.stage === stage);
              return {
                stage,
                leads: stageDealsList.length,
                value: stageDealsList.reduce((sum, d) => sum + (d.value || 0), 0)
              };
            })
            .sort((a, b) => {
              const indexA = PIPELINE_STAGE_ORDER.indexOf(a.stage);
              const indexB = PIPELINE_STAGE_ORDER.indexOf(b.stage);
              return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
          
          console.log('📋 Fallback stages (sorted):', fallbackStats);
          setDeals(fallbackDeals);
          setStageStats(fallbackStats);
        }
        
        setContacts(contactsRes || []);
        setCompanies(companiesRes || []);
        setProjects(projectsRes && Array.isArray(projectsRes) ? projectsRes : projectsData.projects || []);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        
        const fallbackDeals = dealsData.deals || [];
        const fallbackStages = [...new Set(fallbackDeals.map(d => d.stage))].filter(s => s && s !== 'Unclassified');
        const fallbackStats = fallbackStages
          .map(stage => {
            const stageDealsList = fallbackDeals.filter(d => d.stage === stage);
            return {
              stage,
              leads: stageDealsList.length,
              value: stageDealsList.reduce((sum, d) => sum + (d.value || 0), 0)
            };
          })
          .sort((a, b) => {
            const indexA = PIPELINE_STAGE_ORDER.indexOf(a.stage);
            const indexB = PIPELINE_STAGE_ORDER.indexOf(b.stage);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });
        
        setDeals(fallbackDeals);
        setStageStats(fallbackStats);
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
      const getProbabilityFromPipeline = (pipeline, status) => {
        const statusProbabilityMap = {
          'Won': 100,
          'Lost': 0
        };
        
        if (statusProbabilityMap[status] !== undefined) {
          return statusProbabilityMap[status];
        }

        const pipelineProbabilityMap = {
          'New': 10,
          'Discovery': 20,
          'Follow Up': 30,
          'Inpipeline': 40,
          'Conversation': 50,
          'Proposal Sent': 60,
          'Negotiation': 70,
          'Qualified To Buy': 80
        };
        return pipelineProbabilityMap[pipeline] || 10;
      };

      const cleanedData = {
        ...formData,
        company_id: formData.company_id ? parseInt(formData.company_id, 10) : null,
        contact_id: formData.contact_id ? parseInt(formData.contact_id, 10) : null,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id, 10) : null,
        deal_value: formData.deal_value ? parseFloat(formData.deal_value) : null,
      };
      console.log('📤 Creating deal with cleaned data:', cleanedData);
      const response = await dealsAPI.create(cleanedData);
      
      if (response.id) {
        const selectedCompany = companies.find(c => c.id === parseInt(formData.company_id));
        const selectedContact = contacts.find(c => c.id === parseInt(formData.contact_id));
        
        const companyName = selectedCompany?.company_name || selectedCompany?.name || formData.deal_name || 'New Deal';
        const initials = (companyName.substring(0, 2)).toUpperCase();
        
        const dealValue = parseFloat(formData.deal_value) || 0;
        const dealStage = formData.pipeline || 'Qualify To Buy';
        const probability = getProbabilityFromPipeline(dealStage, formData.status);
        
        const newDeal = {
          id: response.id,
          stage: dealStage,
          company: companyName,
          initials: initials,
          value: dealValue,
          email: selectedContact?.email || 'N/A',
          phone: selectedContact?.phone || 'N/A',
          location: selectedContact?.position || 'N/A',
          owner: selectedContact?.first_name && selectedContact?.last_name
            ? `${selectedContact.first_name} ${selectedContact.last_name}`
            : selectedContact?.name || 'Unassigned',
          ownerImage: 'avatar-1',
          progress: probability,
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
        showSuccessToast(`Deal "${formData.deal_name}" created successfully!`);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create deal';
      showErrorToast(errorMessage);
      throw new Error(errorMessage);
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
    console.log('✏️ Editing deal:', deal.id);
    console.log('✏️ Deal object keys:', Object.keys(deal));
    console.log('✏️ Deal company_id:', deal.company_id);
    console.log('✏️ Deal deal_name:', deal.deal_name);
    console.log('✏️ Full deal object:', deal);
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
      showSuccessToast(`Deal "${deleteConfirm.deal.company}" deleted successfully!`);
    } catch (err) {
      console.error('Failed to delete deal:', err);
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
      showErrorToast('Failed to delete deal');
    }
  };

  const handleUpdateDeal = async (formData) => {
    try {
      const getProbabilityFromPipeline = (pipeline, status) => {
        const statusProbabilityMap = {
          'Won': 100,
          'Lost': 0
        };
        
        if (statusProbabilityMap[status] !== undefined) {
          return statusProbabilityMap[status];
        }

        const pipelineProbabilityMap = {
          'New': 10,
          'Discovery': 20,
          'Follow Up': 30,
          'Inpipeline': 40,
          'Conversation': 50,
          'Proposal Sent': 60,
          'Negotiation': 70,
          'Qualified To Buy': 80
        };
        return pipelineProbabilityMap[pipeline] || 10;
      };

      console.log('📝 Updating deal:', selectedDealToEdit.id);
      console.log('📝 Form data being sent:', formData);
      await dealsAPI.update(selectedDealToEdit.id, formData);
      console.log('✅ Deal updated successfully');
      
      const newStage = formData.pipeline || selectedDealToEdit.stage;
      const newStatus = formData.status || selectedDealToEdit.status;
      const newProbability = getProbabilityFromPipeline(newStage, newStatus);
      
      const updatedDeal = {
        ...selectedDealToEdit,
        ...formData,
        stage: newStage,
        value: parseFloat(formData.deal_value) || selectedDealToEdit.value,
        company: formData.company_name || selectedDealToEdit.company,
        progress: newProbability,
      };
      
      setDeals(prev => prev.map(d => d.id === selectedDealToEdit.id ? updatedDeal : d));
      
      const oldStage = selectedDealToEdit.stage;
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
      showSuccessToast(`Deal "${formData.deal_name || 'Unknown'}" updated successfully!`);
    } catch (err) {
      const errorMessage = err.message || 'Failed to update deal';
      showErrorToast(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const groupedDeals = PIPELINE_STAGE_ORDER.map(stage => {
    const stageStat = stageStats.find(s => s.stage === stage);
    return {
      stage: stage,
      leads: stageStat?.leads || 0,
      value: stageStat?.value || 0,
      deals: deals.filter(d => d.stage === stage)
    };
  });
  
  const hasAnyDeals = deals.length > 0;
  console.log('📊 Grouped Deals:', groupedDeals);
  console.log('📊 Has Any Deals:', hasAnyDeals);
  console.log('📊 Total Groups:', groupedDeals.length);
  console.log('📊 Total Deals:', deals.length);

  const handleDragStart = (e, deal) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('dealId', deal.id);
    e.dataTransfer.setData('fromStage', deal.stage);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, toStage) => {
    e.preventDefault();
    const dealId = parseInt(e.dataTransfer.getData('dealId'), 10);
    const fromStage = e.dataTransfer.getData('fromStage');
    
    if (fromStage === toStage) return;
    
    const dealToMove = deals.find(d => d.id === dealId);
    if (!dealToMove) return;

    try {
      const payload = {
        deal_name: dealToMove.deal_name || dealToMove.company,
        company_id: dealToMove.company_id,
        contact_id: dealToMove.contact_id,
        deal_value: dealToMove.value,
        currency: dealToMove.currency || 'USD',
        pipeline: toStage,
        status: dealToMove.status
      };

      await dealsAPI.update(dealId, payload);
      
      const getProbabilityFromPipeline = (pipeline, status) => {
        const statusProbabilityMap = {
          'Won': 100,
          'Lost': 0
        };
        
        if (statusProbabilityMap[status] !== undefined) {
          return statusProbabilityMap[status];
        }

        const pipelineProbabilityMap = {
          'New': 10,
          'Discovery': 20,
          'Follow Up': 30,
          'Inpipeline': 40,
          'Conversation': 50,
          'Proposal Sent': 60,
          'Negotiation': 70,
          'Qualified To Buy': 80
        };
        return pipelineProbabilityMap[pipeline] || 10;
      };

      const updatedDeal = {
        ...dealToMove,
        stage: toStage,
        progress: getProbabilityFromPipeline(toStage, dealToMove.status)
      };

      setDeals(prev => prev.map(d => d.id === dealId ? updatedDeal : d));
      
      setStageStats(prev => prev.map(stat => {
        let newStat = { ...stat };
        if (stat.stage === fromStage) {
          newStat.leads = Math.max(0, newStat.leads - 1);
          newStat.value = newStat.value - dealToMove.value;
        }
        if (stat.stage === toStage) {
          newStat.leads = newStat.leads + 1;
          newStat.value = newStat.value + dealToMove.value;
        }
        return newStat;
      }));
      showSuccessToast(`Deal "${dealToMove.company}" moved to ${toStage}!`);
    } catch (err) {
      console.error('Failed to move deal:', err);
      showErrorToast('Failed to move deal');
    }
  };

  const handleWinDeal = async (deal) => {
    if (deal.stage !== 'Qualified To Buy') return;
    try {
      const payload = {
        deal_name: deal.deal_name || deal.company,
        company_id: deal.company_id,
        contact_id: deal.contact_id,
        deal_value: deal.value,
        currency: deal.currency || 'USD',
        pipeline: 'Won',
        status: 'Won'
      };
      await dealsAPI.update(deal.id, payload);
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: 'Won', status: 'Won', progress: 100 } : d));
      setStageStats(prev => prev.map(stat => {
        if (stat.stage === 'Qualified To Buy') return { ...stat, leads: Math.max(0, stat.leads - 1), value: stat.value - deal.value };
        if (stat.stage === 'Won') return { ...stat, leads: stat.leads + 1, value: stat.value + deal.value };
        return stat;
      }));
      showSuccessToast(`Deal "${deal.company}" won successfully!`);
    } catch (err) {
      console.error('Failed to win deal:', err);
      showErrorToast('Failed to move deal to Won stage');
    }
  };

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
              <div 
                key={group.stage} 
                className="flex-shrink-0 w-96"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, group.stage)}
              >
                <div className="sticky top-0 bg-gray-50 mb-4 pt-0 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <h2 className="text-[15px] font-bold text-gray-900">{group.stage}</h2>
                      </div>
                      <p className="text-[12px] text-gray-600 mt-1">{group.leads} Deals - {formatCurrency(group.value)}</p>
                    </div>
                    <button className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-md transition">
                      <MoreVertical size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 min-h-96">
                  {group.deals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal)}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-3.5 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-move flex-shrink-0 relative"
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

                      {group.stage === 'Qualified To Buy' && (
                        <div className="mb-3">
                          <button 
                            onClick={() => handleWinDeal(deal)}
                            className="w-full bg-green-600 text-white py-2 rounded-lg text-[12px] font-semibold hover:bg-green-700 transition"
                          >
                            🏆 Mark as Won
                          </button>
                        </div>
                      )}

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

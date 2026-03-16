import React, { useState } from 'react';
import { Mail, Phone, MapPin, MoreVertical, Plus } from 'lucide-react';
import companiesData from '../data/companiesListData.json';

const CompaniesList = () => {
  const [companies] = useState(companiesData.companies);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState(companies);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = companies.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
    setFilteredCompanies(filtered);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[#FFA200] text-xs ">★</span>
        <span className="text-xs    text-gray-900">{rating}</span>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-50">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px]  text-gray-900">Companies</h1>
              <span className="bg-[#FFE5E5] text-[#F62416] px-2.5 py-0.5 rounded-full text-[12px] ">125</span>
            </div>
            <div className="flex items-center gap-1 text-xs  mt-1">
              <button className="text-[#F97316] hover:text-[#EA580C]   bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-[#D1D5DB]">&gt;</span>
              <span className="text-[#6B7280]">Companies</span>
            </div>
          </div>
          <button className="bg-[#F62416] text-white p-2  rounded    flex items-center gap-2 hover:opacity-90 transition text-xs ">
            <Plus size={18} />
            Add Company
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full max-w-xs p-2  border border-[#E5E7EB] rounded  focus:outline-none focus:border-gray-400 text-xs  bg-white"
          />
          <button className="p-2  border border-[#E5E7EB] rounded  hover:bg-gray-50 text-xs    text-gray-700 transition bg-white">Filter</button>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="grid grid-cols-4 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white border border-[#EAECF0] rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.05)] p-5">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-12 h-12 rounded  ${company.icon} flex items-center justify-center text-white  text-lg`}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2v2.5c0 .3-.2.5-.5.5s-.5.2-.5.5v1c0 .3.2.5.5.5s.5.2.5.5V10c0 .3-.2.5-.5.5s-.5.2-.5.5v1c0 .3.2.5.5.5s.5.2.5.5v1.5c0 1.1-.9 2-2 2h-8c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h8zm0 18c5.5 0 10-4.5 10-10S17.5 0 12 0 2 4.5 2 10s4.5 10 10 10z" /></svg>
                </div>
                <button className="text-[#9CA3AF] hover:bg-gray-100 p-1 rounded  transition"><MoreVertical size={16} strokeWidth={2} /></button>
              </div>

              <h3 className="text-xs   text-gray-900 truncate mb-1">{company.name}</h3>
              <div className="mb-3">{renderStars(company.rating)}</div>

              <div className="space-y-1.5 mb-3 text-xs  text-[#6B7280]">
                <div className="flex items-center gap-2"><Mail size={15} strokeWidth={1.5} />{company.email}</div>
                <div className="flex items-center gap-2"><Phone size={15} strokeWidth={1.5} />{company.phone}</div>
                <div className="flex items-center gap-2"><MapPin size={15} strokeWidth={1.5} />{company.country}</div>
              </div>

              <div className="flex gap-2 mb-3 flex-wrap">
                {company.tags.map((tag, idx) => (
                  <span key={idx} className={`text-[12px] px-3 py-1 rounded    ${tag === 'Collab' ? 'bg-[#E4F8ED] text-[#28C76F]' : 'bg-[#FFF4DE] text-[#FFA200]'}`}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
                <div className="flex gap-2 text-[#6B7280]">
                  <button className="hover:text-gray-900 transition p-0.5" title="Email"><Mail size={15} strokeWidth={1.5} /></button>
                  <button className="hover:text-gray-900 transition p-0.5" title="Phone"><Phone size={15} strokeWidth={1.5} /></button>
                  <button className="hover:text-gray-900 transition p-0.5" title="Chat"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></button>
                  <button className="hover:text-gray-900 transition p-0.5" title="Call"><Phone size={15} strokeWidth={1.5} /></button>
                </div>
                <div className="flex gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs   border border-white ${company.icon}`}>C</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button className="bg-[#F62416] text-white rounded-[8px] px-8 py-3   hover:opacity-90 transition text-[14px]">Load More</button>
        </div>
      </div>
    </div>
  );
};

export default CompaniesList;

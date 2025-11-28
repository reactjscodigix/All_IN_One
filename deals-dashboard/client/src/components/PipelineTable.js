import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import pipelineData from '../data/pipelineTableData.json';

const PipelineTable = () => {
  const [pipelines] = useState(pipelineData.pipelines);

  return (
    <div className="w-full bg-gray-50">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px] font-bold text-gray-900">Pipeline</h1>
              <span className="bg-[#FFE5E5] text-[#F62416] px-2.5 py-0.5 rounded-full text-[12px] font-bold">125</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] mt-1">
              <button className="text-[#F97316] hover:text-[#EA580C] font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-[#D1D5DB]">&gt;</span>
              <span className="text-[#6B7280]">Pipeline</span>
            </div>
          </div>
          <button className="bg-[#F62416] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition text-[13px]">
            <Plus size={18} />
            Add Pipeline
          </button>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="overflow-x-auto bg-white border border-[#EAECF0] rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EAECF0]">
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Pipeline Name</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Total Deal Value</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">No of Deals</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Stages</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Created Date</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Status</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Action</th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map((pipeline) => (
                <tr key={pipeline.id} className="border-b border-[#EAECF0] hover:bg-gray-50">
                  <td className="px-6 py-4 text-[13px] font-medium text-gray-900">{pipeline.name}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-900">{pipeline.dealValue}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-900">{pipeline.numDeals}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-1 rounded-full" style={{ backgroundColor: pipeline.stageColor }}></div>
                      <span className="text-[13px] text-gray-900">{pipeline.stage}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-900">{pipeline.createdDate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-md text-[12px] font-medium ${pipeline.status === 'Active' ? 'bg-[#E4F8ED] text-[#28C76F]' : 'bg-[#FFE5E5] text-[#F62416]'}`}>
                      {pipeline.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#9CA3AF] hover:bg-gray-100 p-1 rounded"><MoreVertical size={16} strokeWidth={2} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="px-3 py-2 border border-[#EAECF0] rounded-lg hover:bg-gray-50 text-[12px] text-gray-700">←</button>
          <button className="px-3 py-2 bg-[#F62416] text-white rounded-lg text-[12px] font-medium">1</button>
          <button className="px-3 py-2 border border-[#EAECF0] rounded-lg hover:bg-gray-50 text-[12px] text-gray-700">→</button>
        </div>
      </div>
    </div>
  );
};

export default PipelineTable;

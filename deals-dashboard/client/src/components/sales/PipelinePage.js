import React, { useState } from 'react';
import DataTable from '../common/DataTable';
import pipelineData from '../../data/pipelineData.json';

const PipelinePage = () => {
  const [pipelines] = useState(pipelineData.pipelines);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      key: 'name',
      label: 'Pipeline Name',
      sortable: true,
      render: (value) => <span className=" ">{value}</span>
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false
    },
    {
      key: 'deals',
      label: 'Total Deals',
      sortable: true,
      render: (value) => <span className=" ">{value}</span>
    },
    {
      key: 'value',
      label: 'Pipeline Value',
      sortable: true,
      render: (value) => <span className="  text-green-600">{formatCurrency(value)}</span>
    }
  ];

  return (
    <div className="p-2 bg-[#F7F8F9] min-h-screen">
      <div className="mb-8">
        <h1 className="text-[1.250025rem]  text-gray-900">Sales Pipeline</h1>
        <p className="text-gray-600 text-xs ">View all your sales pipelines and progress</p>
      </div>

      <DataTable 
        columns={columns}
        data={pipelines}
        title="All Pipelines"
        searchKeys={['name', 'description']}
      />

      {/* Pipeline Stages Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-8">
        {pipelines.map((pipeline) => (
          <div key={pipeline.id} className="bg-white rounded  border border-border-200 p-2">
            <h3 className="text-md  text-gray-900 mb-4">{pipeline.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs ">
                <span className="text-gray-600">Total Value:</span>
                <span className=" text-gray-900">{formatCurrency(pipeline.value)}</span>
              </div>
              <div className="flex justify-between items-center text-xs ">
                <span className="text-gray-600">Number of Deals:</span>
                <span className=" text-gray-900">{pipeline.deals}</span>
              </div>
              <div className="pt-3 border-t border-border-light">
                <p className="text-xs    text-gray-700 mb-3">Stages:</p>
                <div className="flex flex-wrap gap-2">
                  {pipeline.stages.map((stage, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs   bg-gray-100 text-gray-800"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelinePage;

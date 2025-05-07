import React from 'react';
const CaseStudyCard=({ data }) =>{
    return (
      <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
        <h3 className="text-xl font-bold mb-2">{data.title}</h3>
        <div className="text-sm space-y-1">
          <p><strong>Background:</strong> {data.background}</p>
          <p><strong>Problem:</strong> {data.problem}</p>
          <p><strong>Application:</strong> {data.application}</p>
          <p><strong>Results:</strong> {data.results}</p>
          <p><strong>Reflections:</strong> {data.reflections}</p>
        </div>
      </div>
    );
  }
export default CaseStudyCard  
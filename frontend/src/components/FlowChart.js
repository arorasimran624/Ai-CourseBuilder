import React from 'react';
const FlowchartCard=({ data }) =>{
    return (
      <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
        <h3 className="text-xl font-bold mb-1">{data.title}</h3>
        <p className="text-sm italic">{data.introduction}</p>
        <ul className="list-decimal list-inside text-sm mt-2">
          {data.steps.map((step, i) => <li key={i}>{step}</li>)}
        </ul>
      </div>
    );
  }
 export default FlowchartCard 
import React from 'react';
const RealWorldExampleCard=({ data })=> {
    return (
      <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
        <h3 className="text-xl font-bold mb-2">Real-World Example</h3>
        <div className="text-sm"><strong>Scenario:</strong> {data.scenario}</div>
        <div className="text-sm"><strong>Description:</strong> {data.description}</div>
      </div>
    );
  }
export default RealWorldExampleCard  
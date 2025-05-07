import React from 'react';
const UseCasesCard=({ data })=> {
    return (
      <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
        <h3 className="text-xl font-bold mb-2">Use Cases</h3>
        {data.map((uc, i) => (
          <div key={i} className="text-sm mb-2">
            <strong>{uc.title}</strong>
            <div>Context: {uc.context}</div>
            <div>Application: {uc.application}</div>
            <div>Benefit: {uc.benefit}</div>
          </div>
        ))}
      </div>
    );
  }
  export default UseCasesCard
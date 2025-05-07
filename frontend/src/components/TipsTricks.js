import React from 'react';
const TipsAndTricksCard=({ data }) =>{
    return (
      <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
        <h3 className="text-xl font-bold mb-2">Tips & Tricks</h3>
        <p className="text-sm text-gray-200 whitespace-pre-line">{data}</p>
      </div>
    );
  }
export default TipsAndTricksCard  
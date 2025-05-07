import React from 'react';
const BulletPointsCard=({ data }) =>{
    return (
      <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
        <h3 className="text-xl font-bold mb-2">Points to Remember</h3>
        <ul className="list-disc list-inside text-sm">
          {data.map((point, i) => <li key={i}>{point}</li>)}
        </ul>
      </div>
    );
  }
export default BulletPointsCard  
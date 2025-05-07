import React from 'react';

const OverviewCard = ({ data }) => {
  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
      <h3 className="text-xl font-semibold text-grey-200 mb-3">Overview</h3>
      <p className="text-gray-200leading-relaxed whitespace-pre-line">{data}</p>
    </div>
  );
};

export default OverviewCard;

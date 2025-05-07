import React from 'react';

const KeyPointsCard = ({ data }) => {
  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-gray-200">Key Points</h3>
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-200">
        {data.map((point, i) => (
          <li key={i} className="ml-4">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KeyPointsCard;

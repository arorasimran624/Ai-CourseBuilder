import React from 'react';

const CommonMistakesCard = ({ data }) => {
  const mistakesArray = Array.isArray(data) ? data : data.split(/(?<=\.)\s{2,}/); // Split at double space after periods

  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
      <h3 className="text-xl font-bold mb-2">Common Mistakes</h3>
      <ul className="list-disc list-inside text-sm">
        {mistakesArray.map((mistake, i) => <li key={i}>{mistake}</li>)}
      </ul>
    </div>
  );
};

export default CommonMistakesCard;

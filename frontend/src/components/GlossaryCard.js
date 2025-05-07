import React from 'react';

const GlossaryCard = ({ data }) => {
  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
      <h3 className="text-xl font-bold text-pink-300 mb-4">📚 Glossary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-pink-300 rounded-xl p-4 shadow-sm"
          >
            <h4 className="text-pink-700 font-semibold text-md mb-1">
              {item.term}
            </h4>
            <p className="text-gray-800 text-sm">{item.definition}</p>
            {item.usecase && (
              <p className="text-xs text-gray-500 mt-2">Use: {item.usecase}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlossaryCard;

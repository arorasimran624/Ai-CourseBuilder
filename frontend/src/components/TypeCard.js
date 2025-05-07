import React from 'react';

const TypesCard = ({ data }) => {
  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-gray-200">Types</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((type, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700">
            <h4 className="font-semibold text-gray-300">{type.name}</h4>
            <p className="text-sm text-gray-200 mt-1">{type.description}</p>
            {type.example && (
              <p className="text-xs mt-2 text-gray-200">
                <strong>Example:</strong> {type.example}
              </p>
            )}
            {type.key_uses && (
              <p className="text-xs mt-1 text-gray-200">
                <strong>Key Uses:</strong> {type.key_uses}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypesCard;

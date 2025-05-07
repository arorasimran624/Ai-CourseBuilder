import React from 'react';

const FormulasCard = ({ data }) => {
  // Ensure data.variables is an array
  const variables = Array.isArray(data.variables) ? data.variables : [];

  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
      <h3 className="text-xl font-bold mb-1">{data.title}</h3>
      <p className="text-sm italic">{data.description}</p>
      <div className="bg-gray-700 rounded p-3 font-mono  text-center my-2">{data.formula}</div>
      
      {/* Check if variables is an array before rendering */}
      {variables.length > 0 && (
        <ul className="text-sm list-disc list-inside">
          {variables.map((v, i) => (
            <li key={i}><strong>{v.name}</strong>: {v.description}</li>
          ))}
        </ul>
      )}
      
      {data.derivation && <p className="text-sm mt-2">Derivation: {data.derivation}</p>}
      
      {data.usecases && (
        <ul className="mt-2 text-sm list-disc list-inside">
          {data.usecases.map((uc, i) => <li key={i}>{uc}</li>)}
        </ul>
      )}
    </div>
  );
};

export default FormulasCard;

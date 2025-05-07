import React from 'react';
const AlgorithmCard=({ data })=> {
    return (
      <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
        <h3 className="text-xl font-bold mb-2">{data.title}</h3>
        <p className="mb-2 italic">{data.purpose}</p>
        <pre className="bg-gray-700
         p-3 rounded text-sm whitespace-pre-wrap">{data.steps}</pre>
        <p className="text-sm mt-2">{data.explanation}</p>
        <div className="text-xs text-gray-200 mt-2">
          <strong>Time:</strong> {data.time} | <strong>Space:</strong> {data.space}
        </div>
        {data.tips && <p className="mt-2 text-sm text-gray-500 italic">Tips: {data.tips}</p>}
      </div>
    );
  }
export default AlgorithmCard  
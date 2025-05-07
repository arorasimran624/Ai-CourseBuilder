import React from 'react';

const ParagraphBlock = ({ data }) => {
  if (!data) return null;

  const sentences = data.split('.').filter(Boolean);

  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 mb-6 shadow-md border border-gray-700">
      {sentences.map((sentence, idx) => (
        <p key={idx} className="mb-4 leading-relaxed text-sm">
          {sentence.trim()}.
        </p>
      ))}
    </div>
  );
};

export default ParagraphBlock;

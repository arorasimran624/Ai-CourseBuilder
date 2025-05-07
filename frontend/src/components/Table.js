import React from 'react'
const TableCard=({ data }) =>{
    return (
      <div className="bg-white shadow p-4 rounded-2xl border-l-4 border-yellow-600">
        <h3 className="text-xl font-bold mb-2">{data.title}</h3>
        <p className="text-sm mb-2">{data.explanation}</p>
        <table className="table-auto w-full border text-sm">
          <thead>
            <tr>{data.header.map((head, i) => <th key={i} className="border px-2 py-1">{head}</th>)}</tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j} className="border px-2 py-1">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
 export default TableCard 
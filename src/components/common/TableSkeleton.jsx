import React from 'react';

/**
 * TableSkeleton - Animated skeleton loader for data tables
 * @param {Object} props
 * @param {number} [props.rows=5] - Number of skeleton rows to display
 * @param {number} [props.cols=5] - Number of columns per row
 */
const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse border-b border-slate-100">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="py-4 px-4">
              <div
                className={`h-4 bg-slate-200/80 rounded-lg ${
                  cIdx === 0 ? 'w-3/4' : cIdx === cols - 1 ? 'w-1/2 ml-auto' : 'w-2/3'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;

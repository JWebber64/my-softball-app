import React, { useState, useEffect, useMemo } from 'react';
import { 
  useReactTable, 
  createColumnHelper, 
  getCoreRowModel, 
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table';
import { supabase } from '../lib/supabaseClient';

const StatsDebugger = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('gamesPlayed', {
        header: 'Games',
        cell: info => info.getValue() || 0,
      }),
      columnHelper.accessor('atBats', {
        header: 'AB',
        cell: info => info.getValue() || 0,
      }),
      columnHelper.accessor('hits', {
        header: 'H',
        cell: info => info.getValue() || 0,
      }),
      columnHelper.accessor('avg', {
        header: 'AVG',
        cell: info => (info.getValue() || 0).toFixed(3),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: stats, error: fetchError } = await supabase
          .from('player_stats')
          .select('*')
          .limit(100); // Limiting initial load for testing

        if (fetchError) throw fetchError;
        
        if (isMounted) {
          setData(stats || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching data:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Stats Debugger</h2>
        {isLoading && <p>Loading data...</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left bg-gray-100 border-b cursor-pointer hover:bg-gray-200"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {!isLoading && table.getRowModel().rows.map(row => (
              <tr 
                key={row.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id}
                    className="px-4 py-2 border-b"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && data.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsDebugger;

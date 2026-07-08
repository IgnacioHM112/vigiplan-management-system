export default function Table({ columns, data, onEdit, onDelete, loading, emptyMessage = 'Sin registros' }) {
  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">📭</p>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DataTable = ({ data, columns, onEdit, onDelete }) => {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              {columns.map((column) => (
                <td key={`${item._id}-${column.key}`}>
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              <td className="actions">
                <button onClick={() => onEdit(item)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => onDelete(item._id)} className="delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

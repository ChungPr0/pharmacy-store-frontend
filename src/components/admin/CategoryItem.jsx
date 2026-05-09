const CategoryItem = ({ cat, onEdit, onAddChild, onDelete, parentId = null }) => {
  return (
    <div className="ml-4 mt-2 border-l border-gray-200 pl-4">
      <div className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-100 hover:bg-gray-100 transition min-w-[300px]">
        <span className="font-medium text-gray-700 flex-1">📁 {cat.name}</span>
        
        <div className="flex gap-2">
          <button
            onClick={() => onAddChild(cat)}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
          >
            + Con
          </button>
          <button
            onClick={() => onEdit(cat, parentId)}
            className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition"
          >
            Sửa
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(cat);
            }}
            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition"
          >
            Xóa
          </button>
        </div>
      </div>

      {/* children */}
      {cat.children && cat.children.length > 0 && (
        <div className="mt-1">
          {cat.children.map((child) => (
            <CategoryItem
              key={child.id}
              cat={child}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              parentId={cat.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
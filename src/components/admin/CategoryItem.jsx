const CategoryItem = ({ cat, onEdit, onAddChild, onDelete, parentId = null }) => {
  return (
    <div className="ml-6 mt-3 border-l-2 border-slate-100 pl-4">
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/30 transition-all min-w-[300px] group">
        <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
          </svg>
        </div>
        <span className="font-bold text-slate-700 flex-1 group-hover:text-emerald-700 transition-colors">{cat.name}</span>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(cat)}
            className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-200 hover:border-transparent shadow-sm"
          >
            + Con
          </button>
          <button
            onClick={() => onEdit(cat, parentId)}
            className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-white transition-colors border border-amber-200 hover:border-transparent shadow-sm"
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
            className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-200 hover:border-transparent shadow-sm"
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
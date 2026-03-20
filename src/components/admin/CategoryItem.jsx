const CategoryItem = ({ cat, onDelete }) => {
  return (
    <div className="ml-4 mt-2">

      <div className="flex items-center gap-2">
        <span>📁 {cat.name}</span>

        <button
          onClick={() => onDelete(cat.slug)}
          className="text-red-500 text-sm"
        >
          Xóa
        </button>
      </div>

      {/* children */}
      {cat.children?.map((child) => (
        <CategoryItem
          key={child.id}
          cat={child}
          onDelete={onDelete}
        />
      ))}

    </div>
  );
};

export default CategoryItem;
import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import CategoryItem from "../../components/admin/CategoryItem";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editSlug, setEditSlug] = useState(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(""); // "" means null (root)

  // Flat list for Parent Dropdown
  const [flatList, setFlatList] = useState([]);

  const flattenCategories = (cats, prefix = '', ancestorSlugs = []) => {
    let result = [];
    cats.forEach(c => {
      const currentAncestors = [...ancestorSlugs, c.slug];
      result.push({ 
        id: c.id, 
        name: prefix + c.name,
        slug: c.slug,
        ancestors: currentAncestors
      });
      if (c.children && c.children.length > 0) {
        result = result.concat(flattenCategories(c.children, prefix + '-- ', currentAncestors));
      }
    });
    return result;
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories/tree");
      const data = res.data?.data || [];
      setCategories(data);
      setFlatList(flattenCategories(data));
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi load danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = (parent = null) => {
    setIsEdit(false);
    setEditSlug(null);
    setName("");
    setParentId(parent ? parent.id : "");
    setShowForm(true);
  };

  const handleOpenEdit = (cat, passedParentId = null) => {
    setIsEdit(true);
    setEditSlug(cat.slug);
    setName(cat.name);
    
    let resolvedParentId = "";
    if (passedParentId) {
      resolvedParentId = String(passedParentId);
    } else if (cat.parentId) {
      resolvedParentId = String(cat.parentId);
    }
    
    setParentId(resolvedParentId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    const payload = {
      name: name.trim(),
      parentId: parentId ? Number(parentId) : null
    };

    try {
      if (isEdit) {
        await api.put(`/admin/categories/${editSlug}`, payload);
        toast.success("Cập nhật thành công");
      } else {
        await api.post("/admin/categories", payload);
        toast.success("Thêm thành công");
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (cat) => {
    if (!cat) return;
    
    if (!cat.slug) {
      toast.error("Lỗi: Dữ liệu danh mục không có slug!");
      return;
    }

    if (cat.children && cat.children.length > 0) {
      toast.error("Không thể xóa: Vui lòng xóa các danh mục con trước!");
      return;
    }
    
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) return;
    
    try {
      const res = await api.delete(`/admin/categories/${cat.slug}`);
      toast.success(res.data?.message || "Xóa thành công");
      fetchCategories();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể xóa: Danh mục này đang chứa sản phẩm!";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý danh mục</h2>
        <button
          onClick={() => handleOpenAdd()}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          + Thêm danh mục gốc
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold mb-5 text-gray-800">{isEdit ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Tên danh mục <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Nhập tên danh mục..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 px-3 py-2.5 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Danh mục cha</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="border border-gray-300 px-3 py-2.5 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">-- Không có (Làm danh mục gốc) --</option>
                  {flatList.map(item => {
                    // Prevent circular dependency: cannot choose itself or its descendants as parent
                    const isDisabled = isEdit && item.ancestors.includes(editSlug);
                    return (
                      <option key={item.id} value={item.id} disabled={isDisabled}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
                  {isEdit ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TREE */}
      <div className="bg-white p-4 rounded shadow border border-gray-200 overflow-x-auto">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có danh mục nào.</p>
        ) : (
          <div className="-ml-4">
            {categories.map((cat) => (
              <CategoryItem
                key={cat.id}
                cat={cat}
                onEdit={handleOpenEdit}
                onAddChild={handleOpenAdd}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
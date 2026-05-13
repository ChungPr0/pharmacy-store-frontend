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
    <div className="h-full flex flex-col">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản lý danh mục</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">Sắp xếp, phân loại các sản phẩm trong kho</p>
        </div>
        <button
          onClick={() => handleOpenAdd()}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm danh mục gốc
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative border border-slate-200/60">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-black mb-6 text-slate-800">{isEdit ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Tên danh mục <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Nhập tên danh mục..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Danh mục cha</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium appearance-none"
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

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Hủy
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all">
                  {isEdit ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TREE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex-1 overflow-auto">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">Chưa có danh mục nào.</p>
          </div>
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
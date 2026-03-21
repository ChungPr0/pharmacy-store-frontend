import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import CategoryItem from "../../components/admin/CategoryItem";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(null);

  // 🔥 load tree
  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories/tree");
      setCategories(res.data.data);
    } catch (err) {
      toast.error("Lỗi load danh mục");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ➕ thêm
  const handleAdd = async () => {
    try {
      await api.post("/admin/categories", {
        name,
        parentId,
      });

      toast.success("Thêm thành công");
      setName("");
      setParentId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  // ❌ xóa
  const handleDelete = async (slug) => {
    try {
      await api.delete(`/admin/categories/${slug}`);
      toast.success("Xóa thành công");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Quản lý danh mục</h2>

      {/* FORM */}
      <div className="mb-4 flex gap-2">
        <input
          placeholder="Tên danh mục"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          placeholder="Parent ID (null nếu cấp 1)"
          onChange={(e) => setParentId(e.target.value || null)}
          className="border p-2 rounded"
        />

        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 rounded"
        >
          Thêm
        </button>
      </div>

      {/* TREE */}
      <div className="bg-white p-4 rounded shadow">
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            cat={cat}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default Categories;
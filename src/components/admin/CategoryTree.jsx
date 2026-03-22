import { useState } from "react";
import api from "../../api/axios";

const CategoryTree = ({ data, refresh }) => {

  const [name, setName] = useState("");

  // thêm danh mục
  const handleAdd = async (parentId = null) => {
    try {
      await api.post("/admin/categories", {
        name,
        parentId,
      });

      setName("");
      refresh();

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  // xóa
  const handleDelete = async (slug) => {
    if (!confirm("Xóa danh mục?")) return;

    try {
      await api.delete(`/admin/categories/${slug}`);
      refresh();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <ul className="space-y-2">

      {data.map((cat) => (
        <li key={cat.id} className="bg-white p-3 rounded shadow">

          <div className="flex justify-between items-center">

            <span>{cat.name}</span>

            <div className="flex gap-2">

              <button
                onClick={() => handleAdd(cat.id)}
                className="text-green-600"
              >
                + Thêm con
              </button>

              <button
                onClick={() => handleDelete(cat.slug)}
                className="text-red-500"
              >
                Xóa
              </button>

            </div>

          </div>

          {/* CHILDREN */}
          {cat.children && cat.children.length > 0 && (
            <div className="ml-6 mt-2 border-l pl-4">
              <CategoryTree data={cat.children} refresh={refresh} />
            </div>
          )}

        </li>
      ))}

      {/* ADD ROOT */}
      <li className="mt-4">

        <input
          placeholder="Tên danh mục mới"
          className="border p-2 mr-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={() => handleAdd(null)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Thêm danh mục gốc
        </button>

      </li>

    </ul>
  );
};

export default CategoryTree;
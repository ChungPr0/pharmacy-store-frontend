const Products = () => {
  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold">
          Sản phẩm
        </h2>

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          + Thêm sản phẩm
        </button>

      </div>

      {/* SEARCH */}
      <input
        placeholder="Tìm kiếm..."
        className="border p-2 mb-4 w-64 rounded"
      />

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-green-100">
            <tr>
              <th className="p-3">Ảnh</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>

            {[1,2,3,4,5].map((item) => (
              <tr key={item} className="border-t hover:bg-gray-50">

                <td className="p-3">
                  <img
                    src="https://via.placeholder.com/40"
                    className="w-10"
                  />
                </td>

                <td>Nat C 1000</td>
                <td>105.000đ</td>
                <td>50</td>

                <td className="space-x-2">
                  <button className="text-blue-500">Sửa</button>
                  <button className="text-red-500">Xóa</button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}
      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1 bg-green-600 text-white rounded">1</button>
        <button className="px-3 py-1 border rounded">2</button>
        <button className="px-3 py-1 border rounded">3</button>
      </div>

    </div>
  );
};

export default Products;
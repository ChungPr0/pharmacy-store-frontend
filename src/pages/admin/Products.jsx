import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);

  // Pagination & Filtering
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editSlug, setEditSlug] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState([""]); // Start with 1 empty image input
  const [attributes, setAttributes] = useState([]);

  // --- FETCHING DATA ---
  const flattenCategories = (cats, prefix = "") => {
    let result = [];
    cats.forEach((c) => {
      result.push({
        id: c.id,
        name: prefix + c.name,
        slug: c.slug,
      });
      if (c.children && c.children.length > 0) {
        result = result.concat(flattenCategories(c.children, prefix + "-- "));
      }
    });
    return result;
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories/tree");
      const data = res.data?.data || [];
      setFlatCategories(flattenCategories(data));
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi load danh mục");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/products", {
        params: {
          pageNo,
          pageSize,
          keyword: keyword.trim() || undefined,
          categorySlug: categorySlug || undefined,
        },
      });
      const data = res.data?.data;
      if (data) {
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi load sản phẩm");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [pageNo, pageSize, keyword, categorySlug]);

  // --- FORM HANDLERS ---
  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditSlug("");
    setName("");
    setCategoryId("");
    setPrice("");
    setDescription("");
    setIsActive(true);
    setImages([""]);
    setAttributes([]);
    setShowForm(true);
  };

  const handleOpenEdit = async (slug) => {
    try {
      const res = await api.get(`/admin/products/${slug}`);
      const data = res.data?.data;
      if (data) {
        setIsEdit(true);
        setEditSlug(slug);
        setName(data.name || "");
        setCategoryId(data.categoryId || "");
        setPrice(data.price || "");
        setDescription(data.description || "");
        setIsActive(data.isActive !== undefined ? data.isActive : true);
        
        // Handle images
        if (data.images && data.images.length > 0) {
          setImages(data.images);
        } else {
          setImages([""]);
        }

        // Handle attributes
        if (data.attributes && data.attributes.length > 0) {
          setAttributes(data.attributes);
        } else {
          setAttributes([]);
        }

        setShowForm(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lấy chi tiết sản phẩm");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    if (!price || isNaN(price) || Number(price) < 0) {
      toast.error("Giá sản phẩm không hợp lệ");
      return;
    }

    // Clean up empty images and attributes
    const cleanImages = images.filter((img) => img.trim() !== "");
    const cleanAttributes = attributes.filter(
      (attr) => attr.name.trim() !== "" && attr.value.trim() !== ""
    );

    const payload = {
      name: name.trim(),
      categoryId: Number(categoryId),
      price: Number(price),
      description: description.trim(),
      isActive,
      images: cleanImages,
      attributes: cleanAttributes,
    };

    try {
      if (isEdit) {
        await api.put(`/admin/products/${editSlug}`, payload);
        toast.success("Cập nhật thành công");
      } else {
        await api.post("/admin/products", payload);
        toast.success("Thêm mới thành công");
        setPageNo(0); // Go to first page on create
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await api.patch(`/admin/products/${product.slug}/toggle-status`);
      toast.success(
        `Đã ${product.isActive ? "tạm ngưng" : "mở bán"} sản phẩm`
      );
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đổi trạng thái");
    }
  };

  // --- DYNAMIC FIELDS HELPERS ---
  const handleImageChange = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };
  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages.length ? newImages : [""]);
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
  };
  const addAttributeField = () =>
    setAttributes([...attributes, { name: "", value: "" }]);
  const removeAttributeField = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  // Formatting helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sản phẩm</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Hệ thống đang có tổng cộng <span className="text-blue-600 font-bold">{totalElements}</span> sản phẩm
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm sản phẩm mới
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Tìm kiếm</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
             <input
               type="text"
               placeholder="Tên sản phẩm..."
               value={keyword}
               onChange={(e) => {
                 setKeyword(e.target.value);
                 setPageNo(0);
               }}
               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
             />
          </div>
        </div>
        <div className="w-full md:w-[240px]">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Danh mục</label>
          <select
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              setPageNo(0);
            }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium appearance-none"
          >
            <option value="">Tất cả danh mục</option>
            {flatCategories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4 text-right">Giá</th>
                <th className="px-6 py-4 text-center">Tồn kho</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p>Không tìm thấy sản phẩm nào.</p>
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">Mã: {item.slug}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{item.categoryName || '-'}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${item.totalStockQuantity > 0 ? 'bg-blue-50 text-blue-700 border-blue-200/60' : 'bg-red-50 text-red-700 border-red-200/60'}`}>
                        {item.totalStockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : "bg-slate-100 text-slate-600 border-slate-200/60"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${item.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                        {item.isActive ? "Đang bán" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item.slug)}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-transparent hover:border-blue-200"
                          title="Sửa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors border border-transparent ${
                            item.isActive
                              ? "text-amber-600 bg-amber-50 hover:bg-amber-100 hover:border-amber-200"
                              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-200"
                          }`}
                          title={item.isActive ? "Tạm ngưng" : "Mở bán"}
                        >
                          {item.isActive ? (
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                          ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                             </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-auto flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
             <div className="text-sm font-medium text-slate-500">
                Trang <span className="text-slate-800 font-bold">{pageNo + 1}</span> / {totalPages}
             </div>
             <div className="flex gap-2">
              <button
                disabled={pageNo === 0}
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i;
                // Basic logic to keep current page somewhat centered if total pages > 5
                if (totalPages > 5 && pageNo > 2) {
                   p = pageNo - 2 + i;
                }
                if (p >= totalPages) return null;
                
                return (
                  <button
                    key={p}
                    onClick={() => setPageNo(p)}
                    className={`w-9 h-9 flex items-center justify-center border rounded-xl text-sm font-bold transition-all ${
                      pageNo === p
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
                        : "border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                disabled={pageNo >= totalPages - 1}
                onClick={() => setPageNo((p) => Math.min(totalPages - 1, p + 1))}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
               <h3 className="text-xl font-bold text-gray-800">
                 {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
               </h3>
               <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto">
              <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Left Column: Basic Info */}
                <div className="space-y-5">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">Thông tin cơ bản</h4>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Nhập tên sản phẩm..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border border-gray-300 px-3 py-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="border border-gray-300 px-3 py-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {flatCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="border border-gray-300 px-3 py-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                     <label className="flex items-center gap-2 cursor-pointer mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <input 
                           type="checkbox"
                           checked={isActive}
                           onChange={(e) => setIsActive(e.target.checked)}
                           className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Trạng thái mở bán (Hiển thị lên Web)</span>
                     </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Mô tả sản phẩm</label>
                    <textarea
                      placeholder="Nhập mô tả (hỗ trợ HTML nếu cần)..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border border-gray-300 px-3 py-2.5 rounded-md w-full h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Right Column: Images & Attributes */}
                <div className="space-y-6">
                  {/* Images Section */}
                  <div>
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                       <h4 className="font-semibold text-gray-700">Hình ảnh sản phẩm (URLs)</h4>
                       <button
                         type="button"
                         onClick={addImageField}
                         className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-md hover:bg-blue-100 font-medium transition"
                       >
                         + Thêm ảnh
                       </button>
                    </div>
                    <div className="space-y-3">
                      {images.map((img, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://..."
                            value={img}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            className="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="bg-red-50 text-red-600 px-3 rounded-md hover:bg-red-100 transition"
                            title="Xóa ảnh này"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attributes Section */}
                  <div>
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                       <h4 className="font-semibold text-gray-700">Thuộc tính (Đơn vị, Xuất xứ...)</h4>
                       <button
                         type="button"
                         onClick={addAttributeField}
                         className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-md hover:bg-blue-100 font-medium transition"
                       >
                         + Thêm thuộc tính
                       </button>
                    </div>
                    {attributes.length === 0 ? (
                       <p className="text-sm text-gray-500 italic">Chưa có thuộc tính nào.</p>
                    ) : (
                      <div className="space-y-3">
                        {attributes.map((attr, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <input
                              type="text"
                              placeholder="Tên (VD: Đơn vị)"
                              value={attr.name}
                              onChange={(e) => handleAttributeChange(index, "name", e.target.value)}
                              className="w-1/3 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Giá trị (VD: Hộp 30 viên)"
                              value={attr.value}
                              onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                              className="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeAttributeField(index)}
                              className="bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 transition h-[38px]"
                              title="Xóa thuộc tính này"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-md font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="product-form"
                className="px-5 py-2.5 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
              >
                {isEdit ? "Cập nhật thay đổi" : "Lưu sản phẩm mới"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
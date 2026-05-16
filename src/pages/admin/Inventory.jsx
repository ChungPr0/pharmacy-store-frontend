import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const Inventory = () => {
  // --- STATE LIST ---
  const [batches, setBatches] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchProductId, setSearchProductId] = useState("");

  // --- STATE IMPORT MODAL ---
  const [showImport, setShowImport] = useState(false);
  const [importNote, setImportNote] = useState("");
  const [importRows, setImportRows] = useState([
    {
      id: Date.now(), // temp id for key
      productId: "",
      productName: "",
      batchNumber: "",
      importPrice: "",
      manufactureDate: "",
      expiryDate: "",
      stockQuantity: "",
      error: "",
    },
  ]);
  const [isImporting, setIsImporting] = useState(false);

  // --- PRODUCT SEARCH (DEBOUNCE) ---
  const [productOptions, setProductOptions] = useState([]);
  const [searchingRowId, setSearchingRowId] = useState(null);
  const searchTimeoutRef = useRef(null);

  // FORMAT HELPERS
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  // FETCH INVENTORY HISTORY
  const fetchBatches = async () => {
    try {
      const res = await api.get("/admin/product-batches", {
        params: {
          pageNo,
          pageSize,
          productId: searchProductId || undefined,
        },
      });
      const data = res.data?.data;
      if (data) {
        setBatches(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tải lịch sử nhập kho");
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [pageNo, pageSize, searchProductId]);

  // HANDLE PRODUCT SEARCH
  const handleProductSearch = (keyword, rowId) => {
    setSearchingRowId(rowId);
    
    // update the name in the row so user sees what they type
    updateRow(rowId, "productName", keyword);
    updateRow(rowId, "productId", ""); // reset ID because it's not selected yet

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!keyword.trim()) {
      setProductOptions([]);
      setSearchingRowId(null);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get("/admin/products", {
          params: { keyword: keyword.trim(), pageNo: 0, pageSize: 10 },
        });
        setProductOptions(res.data?.data?.content || []);
      } catch (error) {
        console.error("Lỗi tìm kiếm sản phẩm:", error);
      }
    }, 500); // 500ms debounce
  };

  const selectProduct = (rowId, product) => {
    updateRow(rowId, "productId", product.id);
    updateRow(rowId, "productName", product.name);
    setProductOptions([]);
    setSearchingRowId(null);
  };

  // HANDLE IMPORT ROWS
  const addRow = () => {
    setImportRows([
      ...importRows,
      {
        id: Date.now(),
        productId: "",
        productName: "",
        batchNumber: "",
        importPrice: "",
        manufactureDate: "",
        expiryDate: "",
        stockQuantity: "",
        error: "",
      },
    ]);
  };

  const removeRow = (id) => {
    if (importRows.length === 1) return;
    setImportRows(importRows.filter((row) => row.id !== id));
  };

  const updateRow = (id, field, value) => {
    setImportRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value, error: "" } : row))
    );
  };

  // SUBMIT IMPORT
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    
    // Basic frontend validation
    let hasError = false;
    const validatedRows = importRows.map((row) => {
      let err = "";
      const price = parseFloat(row.importPrice);
      const qty = parseInt(row.stockQuantity, 10);

      if (!row.productId) err = "Vui lòng chọn sản phẩm hợp lệ từ danh sách.";
      else if (!row.batchNumber.trim()) err = "Số lô không được để trống.";
      else if (isNaN(price) || price < 0) err = "Giá nhập không hợp lệ (phải là số >= 0).";
      else if (!row.manufactureDate) err = "Ngày sản xuất không được để trống.";
      else if (!row.expiryDate) err = "Hạn sử dụng không được để trống.";
      else if (new Date(row.manufactureDate) >= new Date(row.expiryDate)) err = "Ngày sản xuất phải trước HSD.";
      else if (isNaN(qty) || qty <= 0) err = "Số lượng phải là số nguyên > 0.";
      
      if (err) hasError = true;
      return { ...row, error: err };
    });

    if (hasError) {
      setImportRows(validatedRows);
      toast.error("Vui lòng kiểm tra lại thông tin các lô hàng.");
      return;
    }

    const payload = {
      importNote: importNote.trim(),
      batches: importRows.map((row) => ({
        productId: Number(row.productId),
        batchNumber: row.batchNumber.trim(),
        importPrice: parseFloat(row.importPrice),
        manufactureDate: row.manufactureDate,
        expiryDate: row.expiryDate,
        stockQuantity: parseInt(row.stockQuantity, 10),
      })),
    };

    setIsImporting(true);
    try {
      const res = await api.post("/admin/product-batches/import", payload);
      toast.success(res.data?.message || "Nhập kho thành công");
      
      // Reset form
      setImportNote("");
      setImportRows([
        {
          id: Date.now(),
          productId: "",
          productName: "",
          batchNumber: "",
          importPrice: "",
          manufactureDate: "",
          expiryDate: "",
          stockQuantity: "",
          error: "",
        },
      ]);
      setShowImport(false);
      setPageNo(0);
      fetchBatches();
    } catch (error) {
      console.error("Import error details:", error.response?.data);
      const data = error.response?.data;
      const errMsg = data?.message || data?.error || "Lỗi nhập kho";
      toast.error(errMsg);
      
      // Try to parse error message to highlight the specific row
      if (errMsg.includes("(Lô: ")) {
        const batchMatch = errMsg.match(/\(Lô:\s*(.*?)\)/);
        if (batchMatch && batchMatch[1]) {
          const errorBatchNum = batchMatch[1];
          setImportRows(prev => prev.map(row => 
            row.batchNumber === errorBatchNum ? { ...row, error: errMsg } : row
          ));
        }
      }
    } finally {
      setIsImporting(false);
    }
  };

  // CHECK EXPIRY ALERT (Less than 3 months)
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const exp = new Date(expiryDate);
    const now = new Date();
    const diffTime = Math.abs(exp - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && exp > now;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Quản lý kho</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Tổng cộng <span className="text-emerald-600 font-bold">{totalElements}</span> lô hàng đã nhập
          </p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nhập kho lô mới
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[240px] md:max-w-[300px]">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Lọc theo ID Sản phẩm</label>
          <input
            type="number"
            placeholder="Nhập ID sản phẩm..."
            value={searchProductId}
            onChange={(e) => {
              setSearchProductId(e.target.value);
              setPageNo(0);
            }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-medium"
          />
        </div>
        <button
          onClick={() => {
            setSearchProductId("");
            setPageNo(0);
          }}
          className="bg-slate-100 text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-bold"
        >
          Xóa lọc
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Mã Lô</th>
                <th className="px-6 py-4 text-right">Giá nhập</th>
                <th className="px-6 py-4 text-center">Tồn / Nhập</th>
                <th className="px-6 py-4 text-center">NSX - HSD</th>
                <th className="px-6 py-4">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p>Chưa có lịch sử nhập kho nào.</p>
                  </td>
                </tr>
              ) : (
                batches.map((item) => {
                  const expired = isExpired(item.expiryDate);
                  const warning = !expired && isExpiringSoon(item.expiryDate);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 line-clamp-2 max-w-[200px] whitespace-normal" title={item.productName}>{item.productName}</div>
                        <div className="text-xs font-medium text-slate-500 mt-1">ID: {item.productId}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">{item.batchNumber}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatCurrency(item.importPrice)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-slate-800 text-base">{item.stockQuantity}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-slate-500 text-xs font-medium mb-1">SX: {formatDate(item.manufactureDate)}</div>
                        <div className={`text-xs font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1 border ${
                          expired ? 'bg-red-50 text-red-700 border-red-200' : 
                          warning ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {expired && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
                          {warning && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                          HD: {formatDate(item.expiryDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium text-xs max-w-[200px] truncate" title={item.importNote}>
                        {item.importNote || "-"}
                      </td>
                    </tr>
                  );
                })
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

      {/* IMPORT MODAL */}
      {showImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl my-8 relative flex flex-col max-h-[90vh] overflow-hidden border border-slate-200/60">
            
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-2xl font-black text-slate-800">Nhập lô hàng loạt</h3>
               <button
                  onClick={() => setShowImport(false)}
                  className="text-slate-400 hover:text-red-500 bg-white shadow-sm border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-full p-2 transition-all"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>

            <div className="p-8 overflow-y-auto bg-slate-50/30 flex-1">
              <form id="import-form" onSubmit={handleImportSubmit}>
                
                <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <label className="block text-sm font-bold mb-2 text-slate-700">Ghi chú nhập kho</label>
                  <input
                    type="text"
                    placeholder="VD: Nhập hàng đợt 1 tháng 3/2026"
                    value={importNote}
                    onChange={(e) => setImportNote(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-800 text-lg">Danh sách lô hàng</h4>
                    <button
                      type="button"
                      onClick={addRow}
                      className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 font-bold transition-colors border border-blue-200/60"
                    >
                      + Thêm lô hàng
                    </button>
                  </div>

                  {importRows.map((row, index) => (
                    <div key={row.id} className={`bg-white p-5 rounded-2xl relative transition-all duration-300 shadow-sm border ${row.error ? 'border-red-400 shadow-red-100/50' : 'border-slate-200/60'}`}>
                      {/* Delete button */}
                      {importRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-2 hover:bg-red-600 hover:text-white border-2 border-white shadow-md z-10 transition-colors"
                          title="Xóa dòng"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      <div className="grid grid-cols-12 gap-5">
                        {/* Product Search */}
                        <div className="col-span-12 md:col-span-3 relative">
                          <label className="block text-xs font-bold mb-1.5 text-slate-700">Sản phẩm <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder="Gõ tên để tìm..."
                            value={row.productName}
                            onChange={(e) => handleProductSearch(e.target.value, row.id)}
                            className={`w-full border px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${row.productId ? 'border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-500/50' : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-500/50'}`}
                          />
                          {!row.productId && row.productName && (
                            <div className="absolute right-3 top-9 text-amber-500 animate-pulse" title="Chưa chọn sản phẩm">⚠️</div>
                          )}

                          {/* Dropdown Options */}
                          {searchingRowId === row.id && productOptions.length > 0 && (
                            <ul className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-auto divide-y divide-slate-100">
                              {productOptions.map((p) => (
                                <li
                                  key={p.id}
                                  onClick={() => selectProduct(row.id, p)}
                                  className="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-sm transition-colors group"
                                >
                                  <div className="font-bold text-slate-800 group-hover:text-emerald-700">{p.name}</div>
                                  <div className="text-xs font-medium text-slate-500 mt-0.5">ID: {p.id} - Tồn kho: <span className="text-emerald-600 font-bold">{p.totalStockQuantity}</span></div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Batch Number */}
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-xs font-bold mb-1.5 text-slate-700">Số Lô <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder="BATCH-..."
                            value={row.batchNumber}
                            onChange={(e) => updateRow(row.id, "batchNumber", e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-sm"
                          />
                        </div>

                        {/* Import Price */}
                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-xs font-bold mb-1.5 text-slate-700">Giá nhập (VNĐ) <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={row.importPrice}
                            onChange={(e) => updateRow(row.id, "importPrice", e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-sm"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="col-span-4 md:col-span-1">
                          <label className="block text-xs font-bold mb-1.5 text-slate-700">Số lượng <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            placeholder="0"
                            min="1"
                            value={row.stockQuantity}
                            onChange={(e) => updateRow(row.id, "stockQuantity", e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-sm"
                          />
                        </div>

                        {/* Dates */}
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-xs font-bold mb-1.5 text-slate-700">Ngày SX <span className="text-red-500">*</span></label>
                          <input
                            type="date"
                            value={row.manufactureDate}
                            onChange={(e) => updateRow(row.id, "manufactureDate", e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-sm text-slate-600"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-xs font-bold mb-1.5 text-slate-700">Hạn SD <span className="text-red-500">*</span></label>
                          <input
                            type="date"
                            value={row.expiryDate}
                            onChange={(e) => updateRow(row.id, "expiryDate", e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium text-sm text-slate-600"
                          />
                        </div>

                      </div>
                      
                      {row.error && (
                        <div className="mt-3 text-sm font-semibold text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-200 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          {row.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </form>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                disabled={isImporting}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="import-form"
                disabled={isImporting}
                className="px-8 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận Nhập kho"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition">

      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-32 object-contain"
      />

      <h3 className="text-sm mt-2 line-clamp-2">
        {product.name}
      </h3>

      <p className="text-green-600 font-bold mt-1">
        {product.price.toLocaleString()} đ
      </p>

      <button className="bg-green-500 text-white px-3 py-1 mt-2 rounded text-sm">
        Thêm
      </button>

    </div>
  );
};

export default ProductCard;
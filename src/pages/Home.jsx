import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";

const Home = () => {

  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {

    const fetchHomeData = async () => {
      try {
        const catRes = await api.get("/categories/tree");
        const bestRes = await api.get("/products/best-sellers?limit=8");
        const latestRes = await api.get("/products/latest?limit=8");

        setCategories(catRes.data.data);
        setBestSellers(bestRes.data.data.content);
        setLatestProducts(latestRes.data.data.content);

      } catch (err) {
        console.log(err);
      }
    };

    fetchHomeData();

  }, []);

  return (
    <div className="bg-[#F5F7F6] min-h-screen">

      {/* HEADER */}
      <Header />

      {/* HERO BANNER */}
      <div className="bg-primary py-10">
        <div className="max-w-[1200px] mx-auto px-4 text-white">
          <h1 className="text-3xl font-bold mb-2">
            NHÀ THUỐC THÁI DƯƠNG
          </h1>
          <p>100% sản phẩm đạt chuẩn GPP</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-10 space-y-10">

        {/* CATEGORY */}
        <section>

          <h2 className="text-xl font-bold mb-4">
            Danh mục
          </h2>

          <div className="grid grid-cols-4 gap-4">

            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-4 rounded-xl shadow text-center hover:shadow-md transition"
              >
                {cat.name}
              </div>
            ))}

          </div>

        </section>

        {/* BEST SELLER */}
        <section>

          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-600">
            🔥 SẢN PHẨM BÁN CHẠY
          </h2>

          <div className="grid grid-cols-4 gap-6">

            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        </section>

        {/* LATEST */}
        <section>

          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-600">
            🆕 SẢN PHẨM MỚI
          </h2>

          <div className="grid grid-cols-4 gap-6">

            {latestProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        </section>

      </div>

    </div>
  );
};

export default Home;
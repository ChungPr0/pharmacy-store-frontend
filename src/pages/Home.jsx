import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

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
    <div className="space-y-10">

      {/* CATEGORY */}
      <section>

        <h2 className="text-xl font-bold mb-4">
          Danh mục
        </h2>

        <div className="grid grid-cols-4 gap-4">

          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-lg shadow text-center"
            >
              {cat.name}
            </div>
          ))}

        </div>

      </section>

      {/* BEST SELLER */}

      <section>

        <h2 className="text-xl font-bold mb-4 text-green-600">
          Sản phẩm bán chạy
        </h2>

        <div className="grid grid-cols-4 gap-4">

          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </section>

      {/* LATEST PRODUCTS */}

      <section>

        <h2 className="text-xl font-bold mb-4 text-green-600">
          Sản phẩm mới
        </h2>

        <div className="grid grid-cols-4 gap-4">

          {latestProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </section>

    </div>
  );
};

export default Home;
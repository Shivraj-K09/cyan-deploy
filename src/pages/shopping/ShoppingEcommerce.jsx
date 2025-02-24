import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import { Footer } from "../footer";

const ShoppingEcommerce = () => {
  const [activeTab, setActiveTab] = useState("낚시용품");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("추천순");
  const [productCategories, setProductCategories] = useState({
    낚시용품: [],
    캠핑용품: [],
    미끼류: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const options = ["추천순", "최신순", "가격순"];

  const handleOptionClick = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*");

      if (error) throw error;

      console.log("Fetched products:", data);

      // Categorize products
      const categorized = {
        낚시용품: [],
        캠핑용품: [],
        미끼류: [],
      };

      data.forEach((product) => {
        if (categorized[product.category]) {
          categorized[product.category].push(product);
        } else {
          console.log("Unknown category:", product.category);
        }
      });

      console.log("Categorized products:", categorized);
      setProductCategories(categorized);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="relative flex items-center border border-green-600 rounded-xl">
          <input
            type="text"
            placeholder="쇼핑 물품 검색"
            className="w-full pl-3 pr-9 py-2 text-green-600 border-none rounded-xl focus:outline-none"
          />
          <FiSearch className="absolute right-3 h-5 w-5 text-green-600" />
        </div>
        <div className="flex items-center justify-between px-10 py-2 space-x-4 text-sm font-medium text-gray-500">
          {Object.keys(productCategories).map((category, index) => (
            <React.Fragment key={category}>
              <button
                className={`${
                  activeTab === category ? "text-black font-bold" : ""
                }`}
                onClick={() => setActiveTab(category)}
              >
                {category}
              </button>
              {index < Object.keys(productCategories).length - 1 && (
                <span className="text-gray-300">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Dropdown */}
      <div className="relative inline-block p-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-3 py-1 font-bold border border-green-600 rounded-full text-green-600 focus:outline-none"
        >
          {selected}
          <FiChevronDown className="ml-1" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-3 gap-2 p-2">
        {productCategories[activeTab] &&
        productCategories[activeTab].length > 0 ? (
          productCategories[activeTab].map((product) => (
            <div
              key={product.id}
              className="space-y-1"
              onClick={() => navigate(`/shopping/${product.id}`)}
            >
              <div className="aspect-square bg-gray-100 rounded-lg">
                {product.image_urls && product.image_urls.length > 0 && (
                  <img
                    src={product.image_urls[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>
              <div>
                <p className="text-[8px] text-wrap font-medium truncate">
                  {product.name}
                </p>
                <p className="text-xs font-medium truncate">{product.name}</p>
                <p className="text-[8px] text-wrap font-medium truncate">
                  {product.description.length > 30
                    ? `${product.description.substring(0, 30)}...`
                    : product.description}
                </p>
                <p className="text-xs text-green-600">{product.price}원</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 flex justify-center items-center h-40 text-gray-500">
            No products found in this category.
          </div>
        )}
      </div>

      <div className="mt-auto fixed bottom-[70px] w-full">
        <Footer />
      </div>
    </div>
  );
};

export default ShoppingEcommerce;

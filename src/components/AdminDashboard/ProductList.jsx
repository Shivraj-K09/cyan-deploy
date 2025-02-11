import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Input } from "../ui/input";
import { EditProductDrawer } from "./EditProductDrawer";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 10;

export default function ProductList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    setIsLoading(true);
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .range(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE - 1
      )
      .order("created_at", { ascending: false });

    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data);
      setTotalCount(count || 0);
    }
    setIsLoading(false);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditDrawerOpen(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) {
        console.error("Error deleting product:", error);
      } else {
        await fetchProducts();
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    const { error } = await supabase
      .from("products")
      .update(updatedProduct)
      .eq("id", updatedProduct.id);

    if (error) {
      console.error("Error updating product:", error);
    } else {
      await fetchProducts();
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const LoadingSkeleton = () => (
    <>
      {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
        <tr key={index} className="border-b border-gray-200 last:border-b-0">
          <td className="py-3 px-4">
            <Skeleton className="h-6 w-32" />
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-6 w-16" />
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-6 w-16" />
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-6 w-24" />
          </td>
          <td className="py-3 px-4">
            <Skeleton className="h-6 w-24" />
          </td>
          <td className="py-3 px-4 text-right">
            <div className="justify-end gap-2 flex">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-14 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            제품 목록
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center mb-4 gap-4">
          <Input
            type="text"
            placeholder="제품 검색..."
            className="flex-grow p-2 border border-gray-300 rounded-lg h-10 text-sm shadow-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search products"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 w-full">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  제품 이름
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  가격
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  재고
                </th>

                <th className="text-right py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  행동
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                products.map((prod) => (
                  <tr
                    key={prod.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="py-3 px-4">
                      <span
                        className="truncate block max-w-[130px] text-sm"
                        title={prod.name}
                      >
                        {prod.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      ₩{prod.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm">{prod.inventory}</td>
                    <td className="py-3 px-4 text-right text-sm">
                      <div className="justify-end gap-2 flex">
                        <button
                          className="text-green-600 p-1 hover:bg-green-100 rounded"
                          onClick={() => handleEditClick(prod)}
                          aria-label={`Edit ${prod.name}`}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        <button
                          className="text-white p-1 bg-red-500 hover:bg-red-700 rounded-lg"
                          onClick={() => handleDeleteClick(prod)}
                          aria-label={`Delete ${prod.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <nav className="inline-flex rounded-md shadow-none">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={`px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                이전
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === i + 1
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={`px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                다음
              </button>
            </nav>
          </div>
        )}

        <EditProductDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          product={selectedProduct}
          onUpdate={handleUpdateProduct}
        />

        {isDeleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">제품 삭제 확인</h2>
              <div className="mb-6">
                <p className="text-sm">
                  이 작업은 실행 취소할 수 없으며 제품이 귀하의 재고에서
                  제거됩니다.
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="bg-gray-200 px-4 py-2 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                  aria-label="Cancel delete"
                >
                  취소
                </button>

                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  onClick={handleConfirmDelete}
                  aria-label="Confirm delete"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

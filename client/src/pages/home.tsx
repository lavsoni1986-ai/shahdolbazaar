import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Star,
  Search,
  MapPin,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

// --- TYPE DEFINITION ---
type Shop = {
  id: string | number;
  name: string;
  category: string;
  image?: string;
  address?: string;
  description?: string;
  avgRating: number;
  reviewCount?: number;
  isFeatured?: boolean;
};

type Product = {
  id: string | number;
  name: string;
  price: string;
  category: string;
  imageUrl?: string;
  description?: string;
  shopId: number;
};

type Offer = {
  id: number;
  content: string;
};

// ==========================================
// PRODUCT CARD - DEFINED OUTSIDE HOME
// ZERO HOOKS - PURE STATELESS COMPONENT
// ==========================================
function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) {
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 relative flex flex-col h-full cursor-pointer">
        {/* Product Image - Clickable */}
        <div className="h-48 overflow-hidden relative bg-slate-50">
          <img
            src={
              product.imageUrl ||
              "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=400"
            }
            loading="lazy"
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          {/* Product Info - Clickable */}
          <div className="mb-2 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2 min-h-[3.5rem]">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                {product.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-orange-600">
                ₹{parseFloat(product.price).toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleAddToCartClick}
              className="h-10 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg flex items-center gap-2 font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ==========================================
// HOME COMPONENT - ALL HOOKS AT TOP
// ==========================================
export default function Home() {
  // ==========================================
  // ALL HOOKS - MUST BE AT THE VERY TOP
  // CALLED IN THE SAME ORDER EVERY RENDER
  // ==========================================
  
  // 1. Context hook - CALLED ONLY ONCE
  const { addToCart } = useCart();

  // 2. All state hooks - ALL CALLED UNCONDITIONALLY
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 3. Callback hooks
  const fetchProducts = useCallback(async () => {
    setLoading(true);

    const categoryForAPI = activeCategory ? activeCategory.toLowerCase() : "";
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "12",
      q: debouncedQuery || "",
      category: categoryForAPI,
    });
    
    const url = `https://shahdol-bazaar-v2.onrender.com/api/products/all?${params.toString()}`;

    try {
      const cacheBuster = `_t=${Date.now()}`;
      const finalUrl = url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
      
      const response = await fetch(finalUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      let productsArray: Product[] = [];
      
      if (data && Array.isArray(data.data)) {
        productsArray = data.data;
      } else if (data && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (Array.isArray(data)) {
        productsArray = data;
      }
      
      setProducts(productsArray);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, activeCategory]);

  const handleAddToCartClick = useCallback((product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      shopId: product.shopId,
    });
    toast.success(`${product.name} added to cart!`);
  }, [addToCart]);

  // 4. All effect hooks - ALL CALLED UNCONDITIONALLY
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    fetch('https://shahdol-bazaar-v2.onrender.com/api/offers')
      .then(res => res.json())
      .then(data => setOffers(data))
      .catch(err => console.error("Error fetching offers:", err));
  }, []);

  useEffect(() => {
    try {
      fetch('https://shahdol-bazaar-v2.onrender.com/api/metrics/visit', { method: 'POST' }).catch(() => {});
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [query, activeCategory]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // ==========================================
  // ALL HOOKS END HERE - NO MORE HOOKS BELOW
  // ==========================================

  // Event handlers (NOT hooks)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setQuery("");
    setActiveCategory(null);
  };

  // Render - ProductCard is called with stable props
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* --- NEWS TICKER / OFFERS SECTION --- */}
      {offers.length > 0 && (
        <div className="bg-[#FFD700] border-b border-yellow-500 overflow-hidden relative group">
          <div className="max-w-6xl mx-auto flex items-center h-10 md:h-12 px-6">
            <div className="flex-shrink-0 flex items-center gap-2 bg-black text-[#FFD700] px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mr-4 animate-pulse">
              <Star size={12} fill="currentColor" />
              Offers & News
            </div>
            <div className="flex-1 overflow-hidden relative h-full flex items-center">
              <div className="flex animate-marquee whitespace-nowrap gap-12 group-hover:[animation-play-state:paused]">
                {offers.map((offer, i) => (
                  <span key={`${offer.id}-${i}`} className="text-slate-900 font-bold text-sm md:text-base">
                    {offer.content}
                  </span>
                ))}
                {/* Duplicate for seamless scrolling */}
                {offers.map((offer, i) => (
                  <span key={`${offer.id}-dup-${i}`} className="text-slate-900 font-bold text-sm md:text-base">
                    {offer.content}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: inline-flex;
              animation: marquee 60s linear infinite;
            }
            .group:hover .animate-marquee {
              animation-play-state: paused;
            }
          `}} />
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10 text-center md:text-left">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Shahdol{" "}
              <span className="text-orange-600 underline decoration-orange-200 decoration-8 underline-offset-8">
                Bazaar
              </span>
            </h1>
            <p className="text-slate-400 font-bold text-xs md:text-sm tracking-[0.4em] uppercase mt-6 mb-8">
              Lead Your Business To Success
            </p>
            <p className="text-slate-500 text-lg md:text-2xl font-medium leading-relaxed mb-10 max-w-xl mx-auto md:mx-0">
              Shahdol ke local businesses ki digital pehchan. Dukanon ko
              dhoondhein aur seedha WhatsApp par order karein.
            </p>

            {/* --- SEARCH FORM --- */}
            <form
              onSubmit={handleSearch}
              className="mt-10 flex flex-col md:flex-row gap-3 group max-w-2xl mx-auto md:mx-0"
            >
              <div className="relative flex-1">
                <button
                  type="submit"
                  aria-label="Search items"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-slate-400 hover:text-orange-600 transition-colors z-10"
                >
                  <Search size={22} />
                </button>

                <input
                  className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-8 focus:ring-orange-600/5 focus:border-orange-600 outline-none transition-all text-lg shadow-sm"
                  placeholder="Dukan ya saman ka naam..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="md:hidden bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                Search Karein
              </button>
            </form>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/2 hidden md:block"></div>
      </section>

      {/* --- CATEGORIES SECTION --- */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  const newCategory = activeCategory === cat.name ? null : cat.name;
                  setActiveCategory(newCategory);
                }}
                className={`group flex flex-col items-center p-3 rounded-xl transition-all duration-300 border ${
                  activeCategory === cat.name
                    ? "bg-orange-50 border-orange-200 shadow-inner scale-95"
                    : "bg-white border-transparent hover:border-slate-100 hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <div
                  className={`mb-2 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    activeCategory === cat.name
                      ? "bg-white text-orange-600 shadow-sm"
                      : "bg-slate-50 text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-600"
                  }`}
                >
                  <cat.icon size={24} />
                </div>
                <div
                  className={`text-[10px] md:text-xs font-bold uppercase tracking-wider text-center ${
                    activeCategory === cat.name
                      ? "text-orange-600"
                      : "text-slate-600 group-hover:text-orange-600"
                  }`}
                >
                  {cat.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- MAIN LISTING --- */}
      <section className="max-w-6xl mx-auto px-6 mt-16 pb-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black text-slate-900">
            {activeCategory
              ? `${activeCategory} Products`
              : query
                ? `Results for "${query}"`
                : "All Products"}
          </h2>

          {(query || activeCategory) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all"
            >
              Clear Filters <X size={16} />
            </button>
          )}
        </div>

        {/* --- LOADING & GRID --- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-slate-200 animate-pulse rounded-[2.5rem]"
              ></div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCartClick}
                />
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex justify-center items-center gap-6 mt-16">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 border border-slate-200 hover:border-orange-500 hover:text-orange-600"
              >
                <ChevronLeft size={18} /> Prev
              </button>

              <span className="font-bold text-slate-400 text-sm tracking-widest">
                PAGE {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-105"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
              <Search size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Products Found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              We couldn't find any products matching your search. Try adjusting your filters or browse all products.
            </p>
            {activeCategory && (
              <p className="text-xs text-slate-400 mt-2">
                Filter: {activeCategory}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

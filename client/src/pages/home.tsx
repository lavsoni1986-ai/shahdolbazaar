import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Star,
  Search,
  MapPin,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CATEGORIES } from "@/lib/data";

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

export default function Home() {
  // --- STATE MANAGEMENT ---
  // 1. searchInput: Jo user abhi type kar raha hai (Visual only)
  const [searchInput, setSearchInput] = useState("");

  // 2. query: Jo actually server ke paas jayega (Enter dabane par)
  const [query, setQuery] = useState("");

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Data States
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Performance: Debounce search input
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // --- DEBOUNCE SEARCH INPUT (Performance optimization) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // --- DATA FETCHING ---
  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "9",
      q: debouncedQuery, // Use debounced query
      category: activeCategory || "",
    });

    fetch(`/api/shops?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setShops(data.data);
          setTotalPages(data.pagination?.totalPages ?? 1);
        } else {
          setShops([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching shops:", err);
        setLoading(false);
        setShops([]);
      });
  }, [page, debouncedQuery, activeCategory]);

  // --- LOGIC: Reset Page on Filter Change ---
  useEffect(() => {
    setPage(1);
  }, [query, activeCategory]);

  // --- ✅ UX POLISH: Scroll to Top on Page Change ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // --- SEARCH HANDLER ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Page reload roko
    setQuery(searchInput); // Ab API call trigger hogi
  };

  // --- CLEAR FILTERS ---
  const clearFilters = () => {
    setSearchInput("");
    setQuery("");
    setActiveCategory(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* --- HERO SECTION --- */}
      <section className="bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10 text-center md:text-left">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Shahdol{" "}
              <span className="text-orange-500 underline decoration-orange-200 decoration-8 underline-offset-8">
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
                {/* Search Icon Button */}
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-slate-400 hover:text-orange-500 transition-colors z-10"
                >
                  <Search size={22} />
                </button>

                <input
                  className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all text-lg shadow-sm"
                  placeholder="Dukan ya saman ka naam..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              {/* Mobile Search Button */}
              <button
                type="submit"
                className="md:hidden bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
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
                onClick={() =>
                  setActiveCategory(
                    activeCategory === cat.name ? null : cat.name,
                  )
                }
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
              ? `${activeCategory} Shops`
              : query
                ? `Results for "${query}"`
                : "Explore All"}
          </h2>

          {/* Clear Filters Button */}
          {(query || activeCategory) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all"
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
        ) : shops.length === 0 ? (
          /* --- EMPTY STATE --- */
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Search size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold text-lg">Dukan nahi mili.</p>
            <p className="text-slate-400 text-sm mt-2">
              Apni dukan register karne ke liye ShahdolBazaar join karein.
            </p>
          </div>
        ) : (
          /* --- SHOP GRID --- */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex justify-center items-center gap-6 mt-16">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 border border-slate-200 hover:border-orange-500 hover:text-orange-500"
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
        )}
      </section>
    </div>
  );
}

// --- SHOP CARD COMPONENT ---
function ShopCard({
  shop,
  isCompact = false,
}: {
  shop: Shop;
  isCompact?: boolean;
}) {
  const isTopRated =
    shop.isFeatured || (shop.avgRating >= 4.5 && (shop.reviewCount || 0) >= 5);
  return (
    <Link href={`/shop/${shop.id}`}>
      <div
        className={`${isCompact ? "min-w-[300px] snap-center" : "w-full"} group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 cursor-pointer relative`}
      >
        {isTopRated && (
          <div className="absolute top-5 left-5 z-10 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-white">
            <Star size={12} className="text-orange-500" fill="currentColor" />{" "}
            {shop.isFeatured ? "FEATURED" : "TOP RATED"}
          </div>
        )}
        <div className="h-52 overflow-hidden relative">
          <img
            src={
              shop.image ||
              "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=400"
            }
            loading="lazy"
            alt={shop.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
        </div>
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-orange-500 transition-colors line-clamp-1">
              {shop.name}
            </h3>
            {shop.avgRating > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-xl text-xs font-black">
                {shop.avgRating} <Star size={12} fill="currentColor" />
              </div>
            )}
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            {shop.category}
          </p>
          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center text-slate-400 text-xs font-bold gap-2">
              <MapPin size={14} className="text-orange-400" />{" "}
              {shop.address?.split(",")[0] || "Shahdol"}
            </div>
            <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white group-hover:bg-orange-500 transition-colors shadow-lg">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

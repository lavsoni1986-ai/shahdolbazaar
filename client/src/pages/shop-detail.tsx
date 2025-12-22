import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  MapPin,
  Phone,
  MessageCircle,
  Share2,
  Store,
} from "lucide-react";

// Shop ka data lane ke liye function
const fetchShop = async (id: string) => {
  const res = await fetch(`/api/shops/${id}`);
  if (!res.ok) {
    throw new Error("Shop not found");
  }
  return res.json();
};

export default function ShopDetail() {
  const [match, params] = useRoute("/shop/:id");
  const id = params?.id;

  // Real Data Fetching 🎣
  const {
    data: shop,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shop", id],
    queryFn: () => fetchShop(id!),
    enabled: !!id, // Jab tak ID na mile tab tak mat dhundo
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-600 h-10 w-10" />
      </div>
    );
  }

  if (error || !shop) {
    return <div className="text-center p-10">Shop nahi mili! 😕</div>;
  }

  // WhatsApp Link banana
  const whatsappLink = `https://wa.me/91${shop.mobile}?text=Hello, I saw your shop on ShahdolBazaar!`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20" data-testid="shop-detail-page">
      {/* 1. Hero Image Section - Mobile optimized */}
      <div className="relative h-48 sm:h-64 md:h-80 bg-slate-200 w-full">
        {shop.image ? (
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl bg-orange-100 text-orange-300">
            🏪
          </div>
        )}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.history.back()}
            data-testid="button-back"
          >
            ← Back
          </Button>
        </div>
      </div>

      {/* 2. Shop Info Card */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                {shop.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
                {shop.name}
              </h1>
            </div>
            {/* Share Button (Optional) */}
            <Button variant="ghost" size="icon" className="text-slate-400">
              <Share2 size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-slate-500 mb-6">
            <MapPin size={18} className="text-orange-500" />
            <p>{shop.address || "Address not provided"}</p>
          </div>

          {/* 3. Action Buttons (Call & WhatsApp) ✅ Fixed */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* CALL BUTTON - Ab ye 'a' tag hai jo seedha dialer kholega */}
            <a href={`tel:${shop.mobile}`} className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg shadow-md transition-transform active:scale-95">
                <Phone className="mr-2 h-5 w-5" /> Call Now
              </Button>
            </a>

            {/* WHATSAPP BUTTON */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg shadow-md transition-transform active:scale-95">
                <MessageCircle className="mr-2 h-5 w-5" /> Chat
              </Button>
            </a>
          </div>

          {/* 4. Description */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Store size={20} className="text-slate-400" />
              About the Shop
            </h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {shop.description || "No description available for this shop."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

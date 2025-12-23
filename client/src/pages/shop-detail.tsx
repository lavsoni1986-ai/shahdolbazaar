import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react"; // ✅ FIXED: Correct import
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
  // ✅ ALL FIXES APPLIED
  const [, params] = useRoute("/shop/:id");
  const id = params?.id;
  const [imageError, setImageError] = useState(false);

  const {
    data: shop,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shop", id],
    queryFn: () => fetchShop(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-600 h-10 w-10" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="text-center p-10 text-red-500 bg-red-50 rounded-2xl mx-4">
        ❌ Shop load नहीं हो पाई। Please try again या back जाइए।
      </div>
    );
  }

  const phone = shop.mobile?.replace(/\D/g, "");
  const message = `Hello ${shop.name || "ShahdolBazaar"} से आपकी दुकान के बारे में जानना है!`;
  const whatsappLink = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${shop.name} - ShahdolBazaar`,
          text:
            shop.description?.substring(0, 100) ||
            "Check this shop on ShahdolBazaar!",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("✅ Link copied to clipboard!");
      }
    } catch {
      // Silent fail
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-slate-50 pb-20"
        data-testid="shop-detail-page"
      >
        {/* ✅ PERFECT Hero Image */}
        <div className="relative h-48 sm:h-64 md:h-80 bg-slate-200 w-full">
          {!imageError && shop.image ? (
            <img
              src={shop.image}
              alt={shop.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
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

        {/* Shop Info Card */}
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
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-orange-600"
                onClick={handleShare}
              >
                <Share2 size={20} />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-slate-500 mb-6">
              <MapPin size={18} className="text-orange-500" />
              <p>{shop.address || "Address not provided"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {phone && (
                <a href={`tel:${phone}`} className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg shadow-md transition-transform active:scale-95">
                    <Phone className="mr-2 h-5 w-5" /> Call Now
                  </Button>
                </a>
              )}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg shadow-md transition-transform active:scale-95">
                  <MessageCircle className="mr-2 h-5 w-5" /> Chat WhatsApp
                </Button>
              </a>
            </div>

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

      {/* 🔥 STICKY WHATSAPP */}
      {shop?.mobile && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-float fixed bottom-5 right-5 p-3 rounded-full shadow-xl z-50 flex items-center justify-center hover:scale-110 transition-all"
          title={`Chat with ${shop.name} on WhatsApp`}
          aria-label={`Chat with ${shop.name} on WhatsApp`}
          style={{ background: "#25D366", width: "64px", height: "64px" }}
        >
          <MessageCircle size={24} />
        </a>
      )}
    </>
  );
}

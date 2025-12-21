import { useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { Phone, MapPin, MessageCircle, Star } from "lucide-react";
import { addReview, getReviews } from "@/lib/reviews";

// Helper to clean phone numbers
function normalizePhone(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

type Review = {
  id?: string;
  name: string;
  rating: number;
  comment: string;
};

export default function ShopDetail() {
  const [, params] = useRoute("/shop/:id");
  const id = params?.id ?? "";

  /* ---------- STATE ---------- */
  const [shop, setShop] = useState<any>(null);
  const [loadingShop, setLoadingShop] = useState(true);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ---------- 1️⃣ LOAD DATA FROM API (UPDATED) ---------- */
  useEffect(() => {
    if (!id) return;
    setLoadingShop(true);

    // ✅ Asli Server Call
    fetch(`/api/shops/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Shop not found");
        return res.json();
      })
      .then((data) => {
        setShop(data);
        // SEO Title Set karna
        document.title = `${data.name} | ShahdolBazaar`;
      })
      .catch((err) => {
        console.error("Error fetching shop:", err);
        setShop(null);
      })
      .finally(() => setLoadingShop(false));

    // Reviews abhi ke liye dummy/lib se aa rahe hain (Baad me API banayenge)
    getReviews(id)
      .then((data: any) => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [id]);

  /* ---------- HELPER LOGIC ---------- */
  const averageRating = useMemo(() => {
    // Agar shop ke paas API se rating aayi hai to wo use karo, nahi to calculate karo
    if (shop?.avgRating) return shop.avgRating;

    if (reviews.length === 0) return "0.0";
    const total = reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews, shop]);

  /* ---------- LOADING & ERROR STATES ---------- */
  if (loadingShop)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );

  if (!shop)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Shop Nahi Mili 😕
        </h2>
        <p className="text-slate-500">
          Shayad ye dukan hata di gayi hai ya ID galat hai.
        </p>
        <a href="/" className="mt-4 text-orange-600 font-bold hover:underline">
          Go Home
        </a>
      </div>
    );

  /* ---------- LINKS PREPARATION ---------- */
  const normalized = normalizePhone(shop.mobile || shop.phone); // API sends 'mobile'

  const whatsappHref = normalized
    ? `https://wa.me/${normalized}?text=${encodeURIComponent(
        `Hello ${shop.name}, main ShahdolBazaar se enquiry karna chahta hoon...`,
      )}`
    : "#";

  // ✅ Google Maps Link Fixed
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${shop.name} ${shop.address || "Shahdol"}`,
  )}`;

  /* ---------- SUBMIT REVIEW ---------- */
  const submitReview = async () => {
    if (!name || !rating || !comment || submitting) return;

    setSubmitting(true);
    try {
      await addReview(id, name, Number(rating), comment);
      setName("");
      setRating("");
      setComment("");
      const updated = await getReviews(id);
      setReviews(updated);
      alert("Review submit ho gaya!");
    } catch (e) {
      alert("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* --- MAIN CARD --- */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row">
            {/* IMAGE SECTION */}
            <div className="md:w-1/2 h-72 md:h-96 overflow-hidden bg-slate-100 relative">
              <img
                src={
                  shop.image ||
                  "https://via.placeholder.com/600x400?text=No+Image"
                }
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/600x400?text=Shop+Image";
                }}
                className="w-full h-full object-cover"
                alt={shop.name}
              />
              {shop.isFeatured && (
                <span className="absolute top-4 left-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  FEATURED
                </span>
              )}
            </div>

            {/* DETAILS SECTION */}
            <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-center">
              <div className="inline-block self-start px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase mb-3">
                {shop.category}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">
                {shop.name}
              </h1>

              <div className="flex items-center mb-4 text-orange-500 font-bold text-lg">
                <Star size={20} fill="currentColor" className="mr-1" />
                {averageRating}
                <span className="text-slate-400 font-normal text-sm ml-2">
                  ({reviews.length} reviews)
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed mb-8">
                {shop.description || "No description available."}
              </p>

              {/* ACTION BUTTONS */}
              <div className="space-y-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all transform hover:-translate-y-1"
                >
                  <MessageCircle size={22} /> Chat on WhatsApp
                </a>

                <div className="grid grid-cols-2 gap-3">
                  {normalized ? (
                    <a
                      href={`tel:${normalized}`}
                      className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                    >
                      <Phone size={18} /> Call
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 border border-slate-100 bg-slate-50 text-slate-300 font-bold py-3 rounded-xl cursor-not-allowed"
                    >
                      <Phone size={18} /> No Number
                    </button>
                  )}

                  <a
                    href={mapsHref}
                    target="_blank"
                    className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-colors"
                  >
                    <MapPin size={18} /> Location
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- REVIEW FORM --- */}
        <div className="mt-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-6 text-xl text-slate-900">
            Write a Review
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Aapka Naam"
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <select
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value="">Star Rating</option>
                <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (Good)</option>
                <option value="3">⭐⭐⭐ (Average)</option>
                <option value="2">⭐⭐ (Poor)</option>
                <option value="1">⭐ (Bad)</option>
              </select>
            </div>

            <textarea
              placeholder="Apna anubhav batayein..."
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 h-32 outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              onClick={submitReview}
              disabled={submitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type Offer = {
  id: number;
  content: string;
};

export default function NewsTicker() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        setOffers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching offers:", err);
        setLoading(false);
      });
  }, []);

  if (loading || offers.length === 0) return null;

  return (
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
  );
}


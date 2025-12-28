import { Link, useLocation } from "wouter";
import { Menu, X, MessageCircle, Bus, Store, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Cart } from "@/components/Cart";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [location] = useLocation();
  const { getTotalItems } = useCart();

  const myWhatsAppNumber = "919753239303";
  const myEmail = "shaholbazaar2.0@gmail.com";
  const myName = "Lav Kumar Soni";
  const cartItemCount = getTotalItems();

  // Route change hote hi menu band karne ke liye
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* --- HEADER SECTION --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <Link href="/">
            <img
              src="/logo.png"
              alt="ShahdolBazaar"
              className="h-10 md:h-14 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
            <Link href="/bus">
              <span
                className={`flex items-center gap-1 cursor-pointer transition-colors ${
                  location === "/bus"
                    ? "text-orange-500"
                    : "text-slate-500 hover:text-orange-500"
                }`}
              >
                <Bus size={16} /> Bus Timetable
              </span>
            </Link>

            <Link href="/about">
              <span
                className={`cursor-pointer transition-colors ${
                  location === "/about"
                    ? "text-orange-500"
                    : "text-slate-500 hover:text-orange-500"
                }`}
              >
                About Us
              </span>
            </Link>

            <Link href="/contact">
              <span
                className={`cursor-pointer transition-colors ${
                  location === "/contact"
                    ? "text-orange-500"
                    : "text-slate-500 hover:text-orange-500"
                }`}
              >
                Contact Us
              </span>
            </Link>

            <Link href="/auth">
              <span
                className={`cursor-pointer transition-colors ${
                  location === "/auth"
                    ? "text-orange-500"
                    : "text-slate-500 hover:text-orange-500"
                }`}
              >
                Partner Login
              </span>
            </Link>

            <Link href="/partner">
              <span
                className={`flex items-center gap-1 cursor-pointer transition-colors ${
                  location === "/partner" || location.startsWith("/partner/")
                    ? "text-orange-500"
                    : "text-slate-500 hover:text-orange-500"
                }`}
              >
                <Store size={16} /> Sell on Shahdol Bazaar
              </span>
            </Link>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-500 hover:text-orange-500 transition-colors"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile: Cart and Menu */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-600"
            >
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </button>
            <button
              className="p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-4 bg-white animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="/bus">
                <span
                  className={`text-sm font-bold flex items-center gap-2 cursor-pointer ${
                    location === "/bus" ? "text-orange-500" : "text-slate-600"
                  }`}
                >
                  <Bus size={18} /> Bus Timetable
                </span>
              </Link>

              <Link href="/about">
                <span
                  className={`text-sm font-bold cursor-pointer ${
                    location === "/about" ? "text-orange-500" : "text-slate-600"
                  }`}
                >
                  About Us
                </span>
              </Link>

              <Link href="/contact">
                <span
                  className={`text-sm font-bold cursor-pointer ${
                    location === "/contact" ? "text-orange-500" : "text-slate-600"
                  }`}
                >
                  Contact Us
                </span>
              </Link>

              <Link href="/auth">
                <span
                  className={`text-sm font-bold cursor-pointer ${
                    location === "/auth" ? "text-orange-500" : "text-slate-600"
                  }`}
                >
                  Partner Login
                </span>
              </Link>

              <Link href="/partner">
                <span
                  className={`text-sm font-bold flex items-center gap-2 cursor-pointer ${
                    location === "/partner" || location.startsWith("/partner/")
                      ? "text-orange-500"
                      : "text-slate-600"
                  }`}
                >
                  <Store size={18} /> Sell on Shahdol Bazaar
                </span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* --- PAGE CONTENT --- */}
      <main className="flex-1">{children}</main>

      {/* Cart Sidebar */}
      <Cart open={isCartOpen} onOpenChange={setIsCartOpen} />

      {/* --- FOOTER SECTION --- */}
      <footer className="border-t py-16 bg-[#0B1221] text-slate-300 text-center md:text-left">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 w-auto mx-auto md:mx-0"
              />
            </div>
            <p className="text-sm text-slate-400">
              Shahdol ka pehla marketplace.
            </p>
          </div>

          <div>
            <span className="block font-bold text-orange-500 mb-6 uppercase text-xs tracking-widest">
              Quick Links
            </span>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/bus">
                  <span className="hover:text-orange-500 cursor-pointer">
                    Bus Timetable
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="hover:text-orange-500 cursor-pointer">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="hover:text-orange-500 cursor-pointer">
                    Contact Us
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">
              Support & Contact
            </h3>
            <div className="space-y-4 text-sm font-medium mb-6">
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-orange-500">Owner:</span> {myName}
              </p>
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-orange-500">Email:</span> {myEmail}
              </p>
            </div>
            <a
              href={`https://wa.me/${myWhatsAppNumber}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-green-600 text-white text-xs font-bold py-3 px-6 rounded-2xl shadow-xl hover:bg-green-700 transition-all"
            >
              <MessageCircle size={18} /> WhatsApp Support
            </a>
          </div>

          <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700">
            <h3 className="font-bold text-white mb-2 uppercase text-xs italic underline decoration-orange-500 underline-offset-8">
              Dukan Badhao
            </h3>
            <Link href="/auth">
              <Button className="w-full bg-white text-slate-900 font-black rounded-xl text-xs mt-4 hover:bg-orange-500 hover:text-white transition-all shadow-lg">
                REGISTER NOW
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

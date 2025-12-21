import { Link, useLocation } from "wouter";
import { Menu, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const myWhatsAppNumber = "918306596557";
  const myEmail = "support@shahdolbazaar.com";

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* --- HEADER SECTION --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* ✅ FIXED: Ab Logo click karne par Page Refresh hoga */}
          <a
            href="/"
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="ShahdolBazaar"
              className="h-10 md:h-14 w-auto object-contain"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold">
            <Link href="/about">
              <a className="text-slate-500 hover:text-orange-500 transition-colors">
                About Us
              </a>
            </Link>

            <Link href="/auth">
              <a className="text-slate-500 hover:text-orange-500 transition-colors">
                Partner Login
              </a>
            </Link>

            <Link href="/auth">
              <Button
                size="sm"
                className="bg-orange-500 text-white rounded-xl shadow-md"
              >
                List Your Shop
              </Button>
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-4 bg-white animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="/about">
                <a
                  className="text-sm font-bold text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </a>
              </Link>

              <Link href="/auth">
                <a
                  className="text-sm font-bold text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Partner Login
                </a>
              </Link>

              <Link href="/auth">
                <Button
                  className="w-full bg-orange-500 text-white font-bold rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  List Your Shop
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* --- PAGE CONTENT --- */}
      <main className="flex-1">{children}</main>

      {/* --- FOOTER SECTION --- */}
      <footer className="border-t py-16 bg-[#0B1221] text-slate-300 text-center md:text-left">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          {/* Brand Info */}
          <div>
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 w-auto mx-auto md:mx-0"
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Shahdol ka pehla hyperlocal marketplace. Hum local vyapariyon ko
              digital takat dete hain.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <Link href="/about">
              <a className="block font-bold text-orange-500 mb-6 uppercase text-xs tracking-widest hover:underline">
                Company →
              </a>
            </Link>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/about">
                  <a className="hover:text-orange-500 transition-colors">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${myEmail}`}
                  className="hover:text-orange-500 transition-colors"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <Link href="/terms">
                  <a className="hover:text-orange-500 transition-colors">
                    Terms of Service
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Support */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">
              Connect
            </h3>
            <p className="text-sm text-slate-400 mb-6 font-bold">
              Gandhi Chowk, Shahdol <br />
              Madhya Pradesh - 484001
            </p>
            <a
              href={`https://wa.me/${myWhatsAppNumber}?text=Hi ShahdolBazaar, mujhe help chahiye.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white text-xs font-bold py-3 px-6 rounded-2xl shadow-xl hover:bg-green-700 transition-all active:scale-95"
            >
              <MessageCircle size={18} /> WhatsApp Support
            </a>
          </div>

          {/* CTA Box */}
          <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700">
            <h3 className="font-bold text-white mb-2 uppercase text-xs italic underline decoration-orange-500 underline-offset-8">
              Dukan Badhao
            </h3>
            <p className="text-[10px] text-slate-400 my-4 text-center leading-relaxed">
              List your shop today and reach 50,000+ local customers.
            </p>
            <Link href="/auth">
              <Button className="w-full bg-white text-slate-900 font-black rounded-xl text-xs mt-4 hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-black/20">
                REGISTER NOW
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-800 text-[10px] font-bold text-slate-600 tracking-[0.3em] uppercase text-center">
          © 2025 SHAHDOLBAZAAR • LEAD YOUR BUSINESS TO SUCCESS
        </div>
      </footer>
    </div>
  );
}

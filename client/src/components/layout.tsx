import { Link, useLocation } from "wouter";
import { Search, Menu, X, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, this would search. For MVP, just go to a category.
    setLocation("/category/grocery");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl md:text-2xl text-primary tracking-tight hover:opacity-90 transition-opacity">
              <ShoppingBag className="h-6 w-6" />
              <span>Shahdol<span className="text-foreground">Bazaar</span></span>
            </a>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-auto relative">
            <Input 
              type="search" 
              placeholder="Search for shops, items, or services..." 
              className="w-full pl-10 bg-muted/50 focus:bg-background transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/admin">
              <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Partner Login</a>
            </Link>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-medium">
              List Your Shop
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-4 bg-background animate-in slide-in-from-top-5">
            <form onSubmit={handleSearch} className="relative">
              <Input 
                type="search" 
                placeholder="Search..." 
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
            <nav className="flex flex-col gap-4">
              <Link href="/admin">
                <a className="text-sm font-medium hover:text-primary">Partner Login</a>
              </Link>
              <Button className="w-full bg-primary text-white">List Your Shop</Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 mt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <ShoppingBag className="h-6 w-6" />
              <span>ShahdolBazaar</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Shahdol's first hyperlocal marketplace. Connecting local businesses with local customers.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/grocery"><a className="hover:text-primary">Grocery</a></Link></li>
              <li><Link href="/category/medical"><a className="hover:text-primary">Medical</a></Link></li>
              <li><Link href="/category/electronics"><a className="hover:text-primary">Electronics</a></Link></li>
              <li><Link href="/category/restaurants"><a className="hover:text-primary">Restaurants</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">About Us</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Gandhi Chowk, Shahdol<br />
              Madhya Pradesh, 484001<br />
              support@shahdolbazaar.com
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ShahdolBazaar. All rights reserved. Made with ❤️ in Shahdol.
        </div>
      </footer>
    </div>
  );
}

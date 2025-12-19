import { Link } from "wouter";
import { CATEGORIES, SHOPS } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, MapPin } from "lucide-react";
import heroImage from "@assets/generated_images/vibrant_indian_digital_marketplace_illustration.png";

export default function Home() {
  const featuredShops = SHOPS.filter(shop => shop.featured);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in slide-in-from-left-5 duration-700">
              <Badge variant="outline" className="bg-white/50 backdrop-blur border-orange-200 text-orange-700 px-4 py-1.5 text-sm font-medium">
                🚀 #1 Local Marketplace in Shahdol
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Your Local Market, <br />
                <span className="text-primary">Now Online.</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Find everything from fresh groceries to electronics, medicines, and services in Shahdol. Direct from your trusted local shops.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/category/grocery">
                  <a className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-primary/90 hover:shadow-orange-500/40 transition-all">
                    Start Shopping
                  </a>
                </Link>
                <Link href="/admin">
                  <a className="inline-flex items-center justify-center rounded-xl border-2 border-orange-200 bg-white/50 backdrop-blur px-8 py-4 text-base font-semibold text-foreground hover:bg-white hover:border-orange-300 transition-all">
                    Register Shop
                  </a>
                </Link>
              </div>
            </div>
            
            <div className="relative animate-in slide-in-from-right-5 duration-700 delay-100 hidden lg:block">
               <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-teal-500/20 rounded-full blur-3xl -z-10" />
               <img 
                src={heroImage} 
                alt="Shahdol Market Illustration" 
                className="w-full h-auto object-cover rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Explore Categories</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <a className="group block">
                  <div className="h-full p-6 bg-card rounded-2xl border hover:border-primary/50 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">View shops &rarr;</p>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Shops Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured in Shahdol</h2>
          <Link href="/category/all">
            <a className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </a>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredShops.map((shop) => (
            <Link key={shop.id} href={`/shop/${shop.id}`}>
              <a className="group block h-full">
                <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={shop.image} 
                      alt={shop.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-orange-600 shadow-sm flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> {shop.rating}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-2">
                       <Badge variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground hover:bg-muted">
                        {CATEGORIES.find(c => c.slug === shop.category)?.name}
                       </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{shop.name}</h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4 h-10">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{shop.address}</span>
                    </div>
                    <div className="text-primary text-sm font-medium group-hover:underline">
                      Visit Shop Page &rarr;
                    </div>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl bg-secondary overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
           
           <div className="relative z-10 px-6 py-16 md:py-24 text-center max-w-2xl mx-auto">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
               Own a business in Shahdol?
             </h2>
             <p className="text-secondary-foreground/90 text-lg mb-8 leading-relaxed">
               Join hundreds of local businesses reaching new customers online. Create your digital shop profile in minutes.
             </p>
             <Link href="/admin">
              <a className="inline-flex items-center justify-center rounded-xl bg-white text-secondary px-8 py-4 text-base font-bold shadow-lg hover:bg-gray-50 transition-colors">
                Register Your Business
              </a>
             </Link>
           </div>
        </div>
      </section>
    </div>
  );
}

import { Link, useParams } from "wouter";
import { CATEGORIES, SHOPS } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowLeft } from "lucide-react";
import NotFound from "./not-found";

export default function CategoryListing() {
  const { slug } = useParams();
  
  // Handle "all" or specific category
  const category = CATEGORIES.find(c => c.slug === slug);
  const shops = slug === 'all' 
    ? SHOPS 
    : SHOPS.filter(shop => shop.category === slug);

  if (!category && slug !== 'all') {
    return <NotFound />;
  }

  const Icon = category?.icon;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-[80vh]">
      {/* Breadcrumb / Header */}
      <div className="mb-8 md:mb-12">
        <Link href="/">
          <a className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </a>
        </Link>
        
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center hidden md:flex`}>
              <Icon className="h-8 w-8" />
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold capitalize mb-2">
              {slug === 'all' ? 'All Shops' : category?.name}
            </h1>
            <p className="text-muted-foreground text-lg">
              {shops.length} {shops.length === 1 ? 'shop' : 'shops'} found in Shahdol
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      {shops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Link key={shop.id} href={`/shop/${shop.id}`}>
              <a className="group block h-full">
                <Card className="h-full overflow-hidden border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-video overflow-hidden bg-muted">
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
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{shop.name}</h3>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{shop.address}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t mt-auto">
                       <span className="text-xs text-muted-foreground">{shop.reviews} reviews</span>
                       <span className="text-sm font-medium text-primary">View Details</span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
          <p className="text-xl font-medium text-muted-foreground">No shops found in this category yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Check back later or explore other categories.</p>
        </div>
      )}
    </div>
  );
}

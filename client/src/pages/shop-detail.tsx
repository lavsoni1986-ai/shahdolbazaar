import { Link, useParams } from "wouter";
import { SHOPS, CATEGORIES } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Phone, MessageCircle, Share2, ArrowLeft, Clock, CheckCircle } from "lucide-react";
import NotFound from "./not-found";

export default function ShopDetail() {
  const { id } = useParams();
  const shop = SHOPS.find(s => s.id === id);

  if (!shop) return <NotFound />;

  const category = CATEGORIES.find(c => c.slug === shop.category);
  const whatsappMessage = encodeURIComponent(`Hi ${shop.name}, I found your shop on ShahdolBazaar. I would like to enquire about...`);
  const whatsappLink = `https://wa.me/${shop.phone}?text=${whatsappMessage}`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + " " + shop.address)}`;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Banner */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
        <img 
          src={shop.image} 
          alt={shop.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
          <Link href={`/category/${shop.category}`}>
            <a className="inline-flex items-center text-white/90 hover:text-white bg-black/20 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to {category?.name}
            </a>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-card rounded-3xl shadow-xl border p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${category?.color} border-0`}>{category?.name}</Badge>
                {shop.featured && (
                   <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50">Verified Business</Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-foreground">{shop.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-muted-foreground">
                <div className="flex items-center gap-1 text-orange-600 font-bold">
                  <Star className="h-5 w-5 fill-current" />
                  <span>{shop.rating}</span>
                  <span className="text-muted-foreground font-medium ml-1">({shop.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-5 w-5" />
                  <span>{shop.address}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 min-w-[250px]">
              <Button asChild size="lg" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md border-0">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 mr-2" /> WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full border-2">
                <a href={`tel:${shop.phone}`}>
                  <Phone className="h-5 w-5 mr-2" /> Call Now
                </a>
              </Button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
              <a href={mapLink} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4 mr-2" /> Get Directions
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <Share2 className="h-4 w-4 mr-2" /> Share Profile
            </Button>
             <div className="flex items-center gap-2 ml-auto text-sm text-green-600 font-medium">
                <Clock className="h-4 w-4" /> Open Now • Closes 9 PM
             </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-6">
                <TabsTrigger value="about" className="rounded-lg px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">About</TabsTrigger>
                <TabsTrigger value="products" className="rounded-lg px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Products/Services</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="prose prose-orange max-w-none">
                  <h3 className="text-2xl font-bold mb-4">About {shop.name}</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {shop.description}
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Serving the Shahdol community with dedication and quality. We ensure our customers get the best products at the most competitive prices. Visit us to experience our premium service.
                  </p>
                </div>

                <div className="bg-muted/30 p-6 rounded-2xl border border-dashed">
                  <h4 className="font-semibold mb-3">Amenities & Features</h4>
                  <ul className="grid grid-cols-2 gap-3 text-sm">
                    {["Digital Payments Accepted", "Home Delivery", "Parking Available", "Wheelchair Accessible"].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="products" className="animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border rounded-xl p-4 flex gap-4 items-center bg-card hover:border-primary/50 transition-colors">
                      <div className="h-16 w-16 bg-muted rounded-lg shrink-0 overflow-hidden">
                         <img src={`https://source.unsplash.com/random/100x100?product,${i}`} className="w-full h-full object-cover" alt="Product" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Popular Item {i}</h4>
                        <p className="text-sm text-muted-foreground">Starting from ₹199</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                   <Button variant="outline">View Full Catalog on WhatsApp</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b last:border-0 pb-4">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">U{i}</div>
                         <div className="font-medium">Local Guide {i}</div>
                         <div className="flex text-orange-500 ml-auto">
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                         </div>
                       </div>
                       <p className="text-sm text-muted-foreground">Great service and wide variety of products. Highly recommended for everyone in Shahdol!</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
               <h3 className="font-semibold mb-4">Location</h3>
               <div className="aspect-square bg-muted rounded-xl mb-4 overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-75" alt="Map Placeholder" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="shadow-lg">View on Google Maps</Button>
                 </div>
               </div>
               <p className="text-sm text-muted-foreground">{shop.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

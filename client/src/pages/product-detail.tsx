import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShoppingCart,
  Store,
  ArrowLeft,
  Package,
  MapPin,
  Phone,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

type Product = {
  id: string | number;
  name: string;
  price: string;
  category: string;
  imageUrl?: string;
  description?: string;
  shopId: number;
};

type Shop = {
  id: number;
  name: string;
  category: string;
  phone?: string;
  mobile?: string;
  address?: string;
  image?: string;
};

const fetchProduct = async (id: string): Promise<Product> => {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(errorData.message || "Product not found");
  }
  return res.json();
};

const fetchShop = async (shopId: number): Promise<Shop> => {
  const res = await fetch(`/api/shops/${shopId}`);
  if (!res.ok) {
    throw new Error("Shop not found");
  }
  return res.json();
};

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);

  // Fetch product
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId!),
    enabled: !!productId,
  });

  // Fetch shop details
  const {
    data: shop,
    isLoading: shopLoading,
  } = useQuery({
    queryKey: ["shop", product?.shopId],
    queryFn: () => fetchShop(product!.shopId),
    enabled: !!product?.shopId,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      shopId: product.shopId,
    });
    
    toast.success(`${product.name} added to cart!`);
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-orange-500 h-12 w-12 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Package className="text-slate-300 h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h1>
          <p className="text-slate-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const defaultImage =
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-slate-600 hover:text-orange-500"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
            <div className="aspect-square relative bg-slate-50">
              {!imageError && product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <img
                  src={defaultImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-orange-500">
                ₹{parseFloat(product.price).toLocaleString()}
              </span>
            </div>

            {/* Shop Info */}
            {shopLoading ? (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <Loader2 className="animate-spin text-slate-400 h-5 w-5" />
                <span className="text-slate-600">Loading shop info...</span>
              </div>
            ) : shop ? (
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center border">
                    {shop.image ? (
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <Store className="text-slate-400 h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                      Sold By
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">
                      {shop.name}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  {shop.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span>{shop.address}</span>
                    </div>
                  )}
                  {(shop.phone || shop.mobile) && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      <span>{shop.mobile || shop.phone}</span>
                    </div>
                  )}
                </div>
                <Link href={`/shop/${shop.id}`}>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Store size={16} className="mr-2" />
                    View All Products from {shop.name}
                  </Button>
                </Link>
              </div>
            ) : null}

            {/* Description */}
            {product.description && (
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Product Description
                </h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-black rounded-xl shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <ShoppingCart size={20} className="mr-2" />
              Add to Cart
            </Button>

            {/* WhatsApp Order Button */}
            <button
              onClick={() => {
                const waNumber = localStorage.getItem("waNumber") || '910000000000'; // Fallback to a placeholder
                const message = `नमस्ते शहडोल बाज़ार, मुझे यह खरीदना है: ${product.name}\nकीमत: ₹${product.price}\nलिंक: ${window.location.origin}/product/${product.id}`;
                const url = `https://wa.me/${waNumber.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
              }}
              className="w-full mt-3 border-2 border-green-500 text-green-600 hover:bg-green-50 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Phone size={18} />
              WhatsApp पर आर्डर करें
            </button>

            {/* Additional Info */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Product Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Product ID:</span>
                  <span className="font-medium text-slate-900">#{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Category:</span>
                  <span className="font-medium text-slate-900">{product.category}</span>
                </div>
                {shop && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shop:</span>
                    <span className="font-medium text-slate-900">{shop.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


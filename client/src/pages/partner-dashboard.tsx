import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Store,
  Loader2,
  LogOut,
  CheckCircle2,
  Edit,
  Plus,
  Trash2,
  X,
  ImageIcon,
  Package,
  TrendingUp,
  Menu,
  Home,
  Settings,
  BarChart3,
} from "lucide-react";

// Shahdol Local Categories
const shopCategories = [
  "Kirana Store",
  "Mobile & Electronics",
  "Cloth House",
  "MEDICAL",
  "Restaurant & Cafe",
  "Saloons & Parlour",
  "Hardware & Paints",
  "Other",
];

const productCategories = [
  "Groceries",
  "Electronics",
  "Clothing",
  "Medicines",
  "Food & Beverages",
  "Beauty & Personal Care",
  "Hardware",
  "Other",
];

/* --- SCHEMAS --- */
const shopFormSchema = z.object({
  name: z.string().min(2, "Shop name kam se kam 2 characters ka ho"),
  category: z.string().min(1, "Category chunnana zaroori hai"),
  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number 10 digits ka hona chahiye"),
  address: z.string().min(5, "Pura pata (address) likhein"),
  description: z
    .string()
    .min(10, "Dukan ke baare mein kam se kam 10 shabd likhein"),
  image: z
    .string()
    .url("Sahi Photo Link (URL) dalein")
    .optional()
    .or(z.literal("")),
});

const productSchema = z.object({
  name: z.string().min(2, "Product ka naam zaroori hai"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Sahi keemat (price) dalein"),
  category: z.string().min(1, "Category chunnana zaroori hai"),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .url("Sahi Photo Link dalein")
    .optional()
    .or(z.literal("")),
});

export default function PartnerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'analytics' | 'settings'>('dashboard');

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const authHeaders = {
    "Content-Type": "application/json",
    "x-user-id": user?.id?.toString() || "",
  };

  // 1. Fetch Shop - MUST be declared before any useEffect that uses it
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["/api/partner/shop"],
    queryFn: async () => {
      const res = await fetch("https://shahdol-bazaar-v2.onrender.com/api/partner/shop", { headers: authHeaders });
      return res.ok ? res.json() : null;
    },
    enabled: !!user?.id, // Only fetch if user exists
  });

  useEffect(() => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    // DISABLED REDIRECT CHECK: Temporarily allow all authenticated users
    // Allow access if user is seller or admin - don't redirect even if shop doesn't exist
    // User can create shop from the dashboard
    // if (user.role !== "seller" && user.role !== "admin") {
    //   toast({
    //     variant: "destructive",
    //     title: "Access Denied",
    //     description: "You need to be a verified seller to access this dashboard.",
    //   });
    //   setLocation("/seller-onboarding");
    //   return;
    // }
  }, [user, setLocation, toast]);

  // Auto-create shop if seller but no shop exists (separate effect to avoid dependency issues)
  useEffect(() => {
    // ENSURE SHOP CREATION: Always try to create shop if user exists and no shop found
    if (user?.id && !shop && !shopLoading) {
      console.log("🔄 Auto-creating default shop for user:", user.id);
      // Try to auto-create a default shop
      const createDefaultShop = async () => {
        try {
          console.log("📞 Calling https://shahdol-bazaar-v2.onrender.com/api/partner/shop/create-default");
          const res = await fetch("https://shahdol-bazaar-v2.onrender.com/api/partner/shop/create-default", {
            method: "POST",
            headers: authHeaders,
          });
          console.log("✅ Shop creation response:", res.status, res.ok);
          if (res.ok) {
            const createdShop = await res.json();
            console.log("✅ Shop created:", createdShop);
            queryClient.invalidateQueries({ queryKey: ["/api/partner/shop"] });
          } else {
            const error = await res.json();
            console.error("❌ Shop creation failed:", error);
          }
        } catch (error) {
          console.error("❌ Failed to create default shop:", error);
        }
      };
      createDefaultShop();
    }
  }, [user, shop, shopLoading, authHeaders, queryClient]);

  // 2. Fetch Products
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products", shop?.id],
    queryFn: async () => {
      const res = await fetch(`https://shahdol-bazaar-v2.onrender.com/api/products?shopId=${shop?.id}`, {
        headers: authHeaders,
      });
      return res.json();
    },
    enabled: !!shop?.id,
  });

  const form = useForm<z.infer<typeof shopFormSchema>>({
    resolver: zodResolver(shopFormSchema),
  });
  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (shop) {
      form.reset({
        name: shop.name || "",
        category: shop.category || "",
        mobile: shop.mobile || shop.phone || "",
        address: shop.address || "",
        description: shop.description || "",
        image: shop.image || "",
      });
    }
  }, [shop, form]);

  const shopMutation = useMutation({
    mutationFn: async (data: any) => {
      const shopId = shop?.id;
      const url = shopId 
        ? `https://shahdol-bazaar-v2.onrender.com/api/shops/${shopId}` 
        : "https://shahdol-bazaar-v2.onrender.com/api/shops";
      const res = await fetch(url, {
        method: shopId ? "PATCH" : "POST",
        headers: authHeaders,
        body: JSON.stringify({ ...data, ownerId: user?.id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/shop"] });
      setShowEditForm(false);
      toast({ title: "Shop details saved successfully! ✅" });
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!shop?.id) {
        throw new Error("Shop not found. Please set up your shop first.");
      }
      const res = await fetch("https://shahdol-bazaar-v2.onrender.com/api/products", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ...data,
          shopId: shop.id,
          sellerId: user?.id,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", shop?.id] });
      setShowProductDialog(false);
      productForm.reset();
      toast({ title: "Product added! 🛍️" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add product. Please try again.",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`https://shahdol-bazaar-v2.onrender.com/api/products/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", shop?.id] });
      toast({ title: "Product removed" });
    },
  });

  // Show loading spinner while fetching shop data
  if (shopLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 h-8 w-8" />
      </div>
    );
  }

  // Calculate summary stats - safely handle undefined shop
  const totalProducts = products?.length || 0;
  const totalValue = (products || []).reduce(
    (sum: number, p: any) => sum + parseFloat(p.price || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:static md:translate-x-0 z-40 w-64 bg-white border-r border-slate-200 h-screen transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
            <Store className="text-orange-500" size={24} />
            <span className="hidden md:block">Partner Dashboard</span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setSidebarOpen(false); // Close mobile sidebar on click
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
              activeTab === 'dashboard'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('products');
              setSidebarOpen(false); // Close mobile sidebar on click
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
              activeTab === 'products'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <Package size={20} />
            <span>Products</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('analytics');
              setSidebarOpen(false); // Close mobile sidebar on click
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('settings');
              setSidebarOpen(false); // Close mobile sidebar on click
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
              activeTab === 'settings'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <Button
            variant="ghost"
            className="w-full text-red-500 font-medium justify-start"
            onClick={() => {
              localStorage.removeItem("user");
              queryClient.clear();
              setLocation("/auth");
            }}
          >
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-20 border-b">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">
              {shop?.name || "Partner Dashboard"}
            </h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 space-y-6">
          {/* Conditional Rendering Based on Active Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Total Products
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {totalProducts}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Shop Status
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-2 flex items-center gap-2">
                    {shop ? (
                      <>
                        <CheckCircle2 size={20} /> Live
                      </>
                    ) : (
                      "Not Setup"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Store className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Total Value
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    ₹{totalValue.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Shop Info Section */}
          {!shop || showEditForm ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              {shop && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => setShowEditForm(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {shop ? "Edit Shop Details" : "Setup Your Shop"}
              </h2>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((d) => shopMutation.mutate(d))}
                  className="space-y-4"
                >
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Shop Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="category"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Category Chunein" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border shadow-xl z-[100]">
                            {shopCategories.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="mobile"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Mobile Number
                        </FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={10} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="image"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Shop Photo URL (Link)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://example.com/dukan.jpg"
                          />
                        </FormControl>
                        {field.value && (
                          <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden border">
                            <img
                              src={field.value}
                              className="h-full w-full object-cover"
                              alt="Shop preview"
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          About Shop
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Dukan ke baare mein..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 h-12 text-lg font-bold shadow-lg hover:bg-orange-700"
                    disabled={shopMutation.isPending}
                  >
                    {shopMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      "Shop Details Save Karein"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 bg-slate-100 rounded-xl overflow-hidden border flex items-center justify-center shrink-0">
                  {shop?.image ? (
                    <img
                      src={shop.image}
                      className="h-full w-full object-cover"
                      alt={shop?.name || "Shop"}
                    />
                  ) : (
                    <Store className="text-slate-400 h-8 w-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {shop?.name || "Shop"}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    {shop?.category || "N/A"} • {shop?.mobile || shop?.phone || "N/A"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowEditForm(true)}
                variant="outline"
                className="rounded-full shadow-sm"
              >
                <Edit size={16} className="mr-2" /> Edit Info
              </Button>
            </div>
          )}
            </>
          )}

          {activeTab === 'products' && shop && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Products & Offers
                </h2>
                <Dialog
                  open={showProductDialog}
                  onOpenChange={setShowProductDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-green-600 shadow-md hover:bg-green-700"
                    >
                      <Plus size={18} className="mr-1" /> Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white rounded-3xl max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">
                        Add New Product
                      </DialogTitle>
                      <DialogDescription>Naya saaman jodein.</DialogDescription>
                    </DialogHeader>
                    <Form {...productForm}>
                      <form
                        onSubmit={productForm.handleSubmit((d) =>
                          addProductMutation.mutate(d),
                        )}
                        className="space-y-4 pt-2"
                      >
                        <FormField
                          name="name"
                          control={productForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">
                                Item Name
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. Fresh Milk" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="category"
                          control={productForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">
                                Category
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Category Chunein" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white border shadow-xl z-[100]">
                                  {productCategories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="price"
                          control={productForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">
                                Keemat (₹)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  inputMode="decimal"
                                  placeholder="99"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="imageUrl"
                          control={productForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">
                                Photo Link (URL)
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="description"
                          control={productForm.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">
                                Details (Optional)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="e.g. 500ml packet"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full bg-green-600 h-12 text-md font-bold shadow-md hover:bg-green-700"
                          disabled={addProductMutation.isPending}
                        >
                          {addProductMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Item Publish Karein"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                {!products || products.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic">
                      Abhi tak koi item nahi hai. Item jodne ke liye 'Add
                      Product' click karein.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Category
                        </TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Description
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="h-12 w-12 bg-white rounded-lg overflow-hidden border flex items-center justify-center shrink-0">
                              {p.imageUrl || p.image ? (
                                <img
                                  src={p.imageUrl || p.image}
                                  className="h-full w-full object-cover"
                                  alt={p.name}
                                />
                              ) : (
                                <ImageIcon className="text-slate-300 h-6 w-6" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {p.category || "N/A"}
                          </TableCell>
                          <TableCell className="font-bold text-green-700">
                            ₹{p.price}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600 max-w-xs truncate">
                            {p.description || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Kya aap is item ko delete karna chahte hain?",
                                  )
                                ) {
                                  deleteProductMutation.mutate(p.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Analytics & Reports</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800">Total Views</h3>
                      <TrendingUp className="text-orange-600" size={24} />
                    </div>
                    <p className="text-3xl font-black text-orange-600">0</p>
                    <p className="text-sm text-slate-600 mt-2">Shop profile views</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800">Orders</h3>
                      <Package className="text-green-600" size={24} />
                    </div>
                    <p className="text-3xl font-black text-green-600">0</p>
                    <p className="text-sm text-slate-600 mt-2">Total orders received</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4">Coming Soon</h3>
                  <p className="text-slate-600">
                    Detailed analytics including sales trends, popular products, and customer insights will be available here.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Settings</h2>
              <div className="space-y-6">
                {shop ? (
                  <>
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="font-bold text-slate-800 mb-4">Shop Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">Shop Name:</span>
                          <span className="font-bold text-slate-900">{shop.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">Category:</span>
                          <span className="font-bold text-slate-900">{shop.category}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">Phone:</span>
                          <span className="font-bold text-slate-900">{shop.mobile || shop.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">Status:</span>
                          <span className="font-bold text-green-600 flex items-center gap-2">
                            <CheckCircle2 size={16} /> {shop.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowEditForm(true)}
                        variant="outline"
                        className="mt-4 w-full"
                      >
                        <Edit size={16} className="mr-2" /> Edit Shop Details
                      </Button>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="font-bold text-slate-800 mb-4">Account Settings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">Username:</span>
                          <span className="font-bold text-slate-900">{user?.username || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">Role:</span>
                          <span className="font-bold text-slate-900 capitalize">{user?.role || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
                    <p className="text-slate-700 font-medium mb-4">
                      Please set up your shop first to access settings.
                    </p>
                    <Button
                      onClick={() => {
                        setShowEditForm(true);
                        setActiveTab('dashboard');
                      }}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Setup Shop
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

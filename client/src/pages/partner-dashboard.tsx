import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
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
} from "lucide-react";

// Categories
const categories = [
  { id: 1, name: "Grocery" },
  { id: 2, name: "Electronics" },
  { id: 3, name: "Clothing" },
  { id: 4, name: "Medical" },
  { id: 5, name: "Restaurant" },
  { id: 6, name: "Salon" },
  { id: 7, name: "Other" },
];

// ✅ Shop Schema with better validation
const shopFormSchema = z.object({
  name: z
    .string()
    .min(2, "Shop name at least 2 characters")
    .max(50, "Shop name max 50 characters"),
  category: z.string().min(1, "Category is required"),
  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  address: z.string().min(5, "Address at least 5 characters").optional(),
  description: z.string().min(10, "Description at least 10 characters").optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

// ✅ Product/Offer Schema
const productSchema = z.object({
  name: z.string().min(2, "Product name at least 2 characters"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valid price required"),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function PartnerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingShop, setCheckingShop] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Safe User Parsing
  let user: any = null;
  try {
    const userStr = localStorage.getItem("user");
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    localStorage.removeItem("user");
  }

  // Shop Form Setup
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: "",
      category: categories[0]?.name || "",
      description: "",
      address: "",
      mobile: "",
      image: "",
    },
  });

  // Product Form Setup
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
    },
  });

  // Check Existing Shop
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
      return;
    }

    async function checkExistingShop() {
      try {
        const res = await fetch(`/api/partner/shop/${user.id}`);
        if (res.status === 404) {
          setCheckingShop(false);
          return;
        }

        const data = await res.json();
        if (data && data.id) {
          console.log("✅ Shop Found:", data);
          setIsEditMode(true);
          setShopId(data.id);
          setShowEditForm(false); // Hide form by default in edit mode

          form.reset({
            name: data.name,
            category: data.category,
            description: data.description || "",
            address: data.address || "",
            mobile: data.mobile,
            image: data.image || "",
          });
        }
      } catch (error) {
        console.log("Create Mode Active");
      } finally {
        setCheckingShop(false);
      }
    }

    checkExistingShop();
  }, [user, setLocation, form]);

  // Submit Shop Handler
  const onSubmit = async (data: ShopFormValues) => {
    if (!user) return;
    setLoading(true);

    try {
      const url = isEditMode ? `/api/shops/${shopId}` : "/api/shops";
      const method = isEditMode ? "PATCH" : "POST";
      const payload = { ...data, ownerId: user.id };

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save shop");
      const savedShop = await res.json();

      if (!isEditMode) {
        setIsEditMode(true);
        setShopId(savedShop.id);
        setShowEditForm(false);
      }

      toast({
        title: isEditMode ? "Shop Updated! ✏️" : "Shop Created! 🎉",
        description: "Your shop details are saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save shop.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add Product Handler
  const onAddProduct = async (data: ProductFormValues) => {
    if (!shopId) return;

    const newProduct = {
      id: Date.now(),
      ...data,
      shopId,
    };

    setProducts([...products, newProduct]);
    productForm.reset();
    setShowProductDialog(false);

    toast({
      title: "Product Added! ✅",
      description: `${data.name} added to your shop.`,
    });
  };

  // Remove Product Handler
  const removeProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
    toast({
      title: "Product Removed",
      description: "Product deleted from your shop.",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/auth");
  };

  if (checkingShop) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Store className="text-orange-500" />
          <h1 className="font-bold text-lg">Partner Dashboard</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-red-500"
          data-testid="button-logout"
        >
          <LogOut size={18} className="mr-1" /> Logout
        </Button>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-8">
        {/* Status Alert */}
        <div
          className={`border p-4 rounded-xl flex gap-3 items-start ${
            isEditMode
              ? "bg-green-50 border-green-200"
              : "bg-orange-50 border-orange-200"
          }`}
          data-testid="status-alert"
        >
          {isEditMode ? (
            <>
              <CheckCircle2 className="text-green-600 shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-green-800">Shop is Live ✅</h2>
                <p className="text-sm text-green-700">
                  Your shop is active and visible to customers.
                </p>
              </div>
            </>
          ) : (
            <>
              <Store className="text-orange-600 shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-orange-800">Welcome Partner!</h2>
                <p className="text-sm text-orange-700">
                  Fill in your shop details to get started.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Shop Details Section */}
        {isEditMode && !showEditForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{form.getValues("name")}</h2>
                <p className="text-sm text-muted-foreground">
                  {form.getValues("category")} • {form.getValues("mobile")}
                </p>
              </div>
              <Button
                onClick={() => setShowEditForm(true)}
                className="bg-orange-500 text-white"
                data-testid="button-edit-shop"
              >
                <Edit size={18} className="mr-2" /> Edit
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-muted-foreground font-semibold mb-1">
                  Address
                </p>
                <p>{form.getValues("address") || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold mb-1">
                  Description
                </p>
                <p className="line-clamp-2">
                  {form.getValues("description") || "Not provided"}
                </p>
              </div>
            </div>

            {form.getValues("image") && (
              <img
                src={form.getValues("image")}
                alt="Shop"
                className="mt-6 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>
        )}

        {/* Edit Form - Toggle Show/Hide */}
        {(showEditForm || !isEditMode) && (
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {isEditMode ? "Edit Shop Details ✏️" : "Create New Shop ✨"}
              </h2>
              {isEditMode && showEditForm && (
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                data-testid="form-shop-details"
              >
                {/* Shop Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Shop Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Fresh Vegetables Store"
                          {...field}
                          data-testid="input-shop-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mobile */}
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        Mobile Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="9876543210"
                          {...field}
                          data-testid="input-mobile"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your shop address..."
                          {...field}
                          data-testid="textarea-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell customers about your shop..."
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Image Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          data-testid="input-image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-6 text-lg font-bold"
                  disabled={loading}
                  data-testid="button-save-shop"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : isEditMode ? (
                    "Save Changes ✏️"
                  ) : (
                    "Publish My Shop 🚀"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* Products/Offers Section - Only Show When Shop Exists */}
        {isEditMode && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Products & Offers</h2>
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 text-white" data-testid="button-add-product">
                    <Plus size={18} className="mr-2" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Add a product or offer to your shop
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...productForm}>
                    <form
                      onSubmit={productForm.handleSubmit(onAddProduct)}
                      className="space-y-4"
                      data-testid="form-add-product"
                    >
                      <FormField
                        control={productForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Fresh Tomatoes"
                                {...field}
                                data-testid="input-product-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="99.99"
                                {...field}
                                data-testid="input-product-price"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Product details..."
                                {...field}
                                data-testid="textarea-product-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-green-600"
                        data-testid="button-save-product"
                      >
                        Add Product ✅
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Products List */}
            {products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-start p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    data-testid={`product-item-${product.id}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₹{product.price}
                      </p>
                      {product.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                      className="text-red-500 hover:text-red-700"
                      data-testid={`button-delete-product-${product.id}`}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">No products added yet</p>
                <p className="text-sm">
                  Add your first product to showcase it to customers
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

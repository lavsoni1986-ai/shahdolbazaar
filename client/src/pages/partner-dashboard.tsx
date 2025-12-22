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
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2, LogOut, CheckCircle2 } from "lucide-react";

// ✅ FIX: Categories ko yahi define kar diya (Import error se bachne ke liye)
const categories = [
  { id: 1, name: "Grocery" },
  { id: 2, name: "Electronics" },
  { id: 3, name: "Clothing" },
  { id: 4, name: "Medical" },
  { id: 5, name: "Restaurant" },
  { id: 6, name: "Salon" },
  { id: 7, name: "Other" },
];

// 1. Frontend Schema
const shopFormSchema = z.object({
  name: z.string().min(2, "Shop name kam se kam 2 akshar ka hona chahiye"),
  category: z.string().min(1, "Category select karna zaroori hai"),
  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number sahi 10 anko ka hona chahiye"),
  address: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

export default function PartnerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingShop, setCheckingShop] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);

  // Safe User Parsing
  let user: any = null;
  try {
    const userStr = localStorage.getItem("user");
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    localStorage.removeItem("user");
  }

  // Form Setup
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: "",
      // ✅ AB YE FAIL NAHI HOGA (Kyunki categories yahi maujood hai)
      category: categories[0]?.name || "",
      description: "",
      address: "",
      mobile: "",
      image: "",
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
        if (res.status === 404) return;

        const data = await res.json();
        if (data && data.id) {
          console.log("✅ Dukan Mil Gayi:", data);
          setIsEditMode(true);
          setShopId(data.id);

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

  // Submit Handler
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
      }

      toast({
        title: isEditMode ? "Shop Updated! ✏️" : "Shop Created! 🎉",
        description: "Success!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save.",
      });
    } finally {
      setLoading(false);
    }
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
        >
          <LogOut size={18} className="mr-1" /> Logout
        </Button>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <div
          className={`border p-4 rounded-xl mb-6 flex gap-3 items-start ${isEditMode ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}
        >
          {isEditMode ? (
            <>
              <CheckCircle2 className="text-green-600 shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-green-800">Shop is Live ✅</h2>
                <p className="text-sm text-green-700">
                  Aapki dukan active hai.
                </p>
              </div>
            </>
          ) : (
            <>
              <Store className="text-orange-600 shrink-0 mt-1" />
              <div>
                <h2 className="font-bold text-orange-800">Welcome Partner!</h2>
                <p className="text-sm text-orange-700">Niche form bharein.</p>
              </div>
            </>
          )}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 bg-white p-6 rounded-2xl shadow-sm"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? "Edit Shop Details ✏️" : "Create New Shop ✨"}
            </h2>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Link</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-orange-500 text-white py-6 text-lg font-bold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : isEditMode ? (
                "Update Changes"
              ) : (
                "Publish My Shop"
              )}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Store, LogOut, Save, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToFirebase } from "@/lib/firebase";

type LocalUser = { id: number; username: string; role?: string };

export default function PartnerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<LocalUser | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [existingShopId, setExistingShopId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Grocery",
    description: "",
    mobile: "",
    address: "",
    image: "",
  });

  // ✅ FIXED LOGIC
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setLocation("/auth");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Agar User ID hai, tabhi shop check karo
    if (parsedUser.id) {
      fetch(`/api/partner/shop/${parsedUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setExistingShopId(data.id);
            setFormData({
              name: data.name,
              category: data.category,
              description: data.description || "",
              mobile: data.mobile,
              address: data.address || "",
              image: data.image || "",
            });
          }
          setFetching(false); // Stop loading
        })
        .catch((err) => {
          console.error(err);
          setFetching(false);
        });
    } else {
      // ⚠️ Agar purana user hai jiske paas ID nahi hai, to logout karwa do
      localStorage.removeItem("user");
      setLocation("/auth");
    }
  }, [setLocation]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const downloadURL = await uploadImageToFirebase(file);
      setFormData((prev) => ({ ...prev, image: downloadURL }));
      toast({ title: "Success", description: "Photo upload ho gayi!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !/^\d{10}$/.test(formData.mobile)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Naam aur sahi Mobile number zaroori hai.",
      });
      return;
    }

    setLoading(true);
    try {
      let url = "/api/shops";
      let method = "POST";
      let bodyData: any = { ...formData, ownerId: user?.id };

      if (existingShopId) {
        url = `/api/shops/${existingShopId}`;
        method = "PATCH";
      } else {
        bodyData = {
          ...bodyData,
          rating: 0,
          avgRating: 0,
          isFeatured: false,
          approved: true,
        };
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        toast({ title: existingShopId ? "Updated! ✅" : "Published! 🎉" });
        if (!existingShopId) {
          const newShop = await response.json();
          setExistingShopId(newShop.id);
        }
      } else {
        toast({ variant: "destructive", title: "Error" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Server Error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLocation("/auth");
  };

  if (!user || fetching)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <Store size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800">My Dukan</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {existingShopId ? "Edit Mode ✏️" : "Create Mode ✨"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="text-red-500 border-red-100"
        >
          <LogOut size={16} className="mr-2" /> Logout
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8">
          <h2 className="text-3xl font-black mb-2">
            Namaste, {user.username}!
          </h2>
          <p className="opacity-80">
            {existingShopId
              ? "Details update karein."
              : "Business online karein."}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Dukan Ka Naam
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Grocery">Grocery</option>
                <option value="Medical">Medical</option>
                <option value="Restaurants">Restaurants</option>
                <option value="Mobile">Mobile</option>
                <option value="Services">Services</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Mobile</label>
              <Input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="h-12"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Address
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="h-12"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Photo</label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="file:bg-orange-50 file:text-orange-600 file:border-0 file:rounded-lg h-14 pt-2"
                />
                {uploading && (
                  <Loader2 className="animate-spin text-orange-500" />
                )}
              </div>
              {formData.image && (
                <div className="mt-4 w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="h-32 text-base"
              />
            </div>
          </div>
          <div className="mt-8">
            <Button
              onClick={handleSave}
              disabled={loading || uploading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 text-lg rounded-xl shadow-lg"
            >
              {loading
                ? "Saving..."
                : existingShopId
                  ? "UPDATE SHOP"
                  : "PUBLISH SHOP"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

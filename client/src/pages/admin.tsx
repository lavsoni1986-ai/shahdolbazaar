import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Trash2,
  CheckCircle,
  Shield,
  Store,
  XCircle,
} from "lucide-react";

export default function Admin() {
  const { toast } = useToast();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔐 Simple Security Lock
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 1. Dukan Fetch Karne ka Function
  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shops"); // Backend se saari dukane mangwao
      const data = await res.json();
      setShops(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load shops",
      });
    } finally {
      setLoading(false);
    }
  };

  // Login hone ke baad data lao
  useEffect(() => {
    if (isAuthenticated) {
      fetchShops();
    }
  }, [isAuthenticated]);

  // 2. Approve Action
  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/shops/${id}/approve`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");

      // UI update karo bina refresh kiye
      setShops(shops.map((s) => (s.id === id ? { ...s, approved: true } : s)));
      toast({
        title: "Approved! ✅",
        description: "Shop is now Live on Homepage.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not approve.",
      });
    }
  };

  // 3. Delete Action
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? Ye dukan humesha ke liye delete ho jayegi! ⚠️"))
      return;

    try {
      const res = await fetch(`/api/shops/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");

      // UI se hatao
      setShops(shops.filter((s) => s.id !== id));
      toast({
        title: "Deleted! 🗑️",
        description: "Shop removed from database.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete.",
      });
    }
  };

  // 🔒 Lock Screen UI
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <Shield className="h-16 w-16 text-orange-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">ShahdolBazaar Admin</h1>
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Enter Admin PIN"
            className="text-black w-40"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <Button
            onClick={() =>
              pin === "1234"
                ? setIsAuthenticated(true)
                : alert("Wrong PIN! Try 1234")
            }
            className="bg-orange-600 hover:bg-orange-700"
          >
            Unlock
          </Button>
        </div>
      </div>
    );
  }

  // 🏠 Dashboard UI
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="text-orange-600" /> Admin Dashboard
            </h1>
            <p className="text-slate-500">Manage all shops in Shahdol Bazaar</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow border">
            <span className="text-sm font-bold text-slate-500">
              Total Shops
            </span>
            <div className="text-2xl font-bold text-slate-800">
              {shops.length}
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-orange-600 h-8 w-8" />
          </div>
        ) : (
          <div className="grid gap-4">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4"
              >
                {/* Shop Info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {shop.image ? (
                      <img
                        src={shop.image}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{shop.name}</h3>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {shop.category}
                      </span>
                      {shop.approved ? (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                          <CheckCircle size={10} /> Live
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                          <XCircle size={10} /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Buttons */}
                <div className="flex gap-2 w-full md:w-auto">
                  {!shop.approved && (
                    <Button
                      onClick={() => handleApprove(shop.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                    >
                      <CheckCircle size={16} className="mr-1" /> Approve
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(shop.id)}
                    size="sm"
                    variant="destructive"
                    className="flex-1 md:flex-none"
                  >
                    <Trash2 size={16} className="mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}

            {shops.length === 0 && (
              <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-xl">
                No shops found in database.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

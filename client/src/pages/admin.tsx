import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type Product = { id?: number | string; name: string; price?: string | number; category?: string };
type Offer = { id?: number; content: string; isActive: boolean };

export default function Admin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [showOfferCreate, setShowOfferCreate] = useState(false);
  const [newProduct, setNewProduct] = useState<Product & { imageUrl?: string }>({ name: "", price: "", category: "", imageUrl: "" });
  const [newOffer, setNewOffer] = useState<string>("");
  const [waNumber, setWaNumber] = useState<string>(localStorage.getItem("waNumber") || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      fetchStats();
      fetchProducts();
      fetchOffers();
    }
  }, [loggedIn]);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) return setVisitors(null);
      const d = await res.json();
      setVisitors(d.visitors ?? null);
    } catch (e) {
      setVisitors(null);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products/all");
      if (!res.ok) return setProducts([]);
      const d = await res.json();
      setProducts(d.data || d || []);
    } catch (e) {
      setProducts([]);
    }
  }

  async function fetchOffers() {
    try {
      const res = await fetch(`/api/admin/offers?t=${Date.now()}`, {
        headers: { "x-user-id": "1" }
      });
      if (!res.ok) {
        return setOffers([]);
      }
      const d = await res.json();
      setOffers(d);
    } catch (e) {
      setOffers([]);
    }
  }

  function handleLogin() {
    if (password === "shahdol123") {
      setLoggedIn(true);
      toast.success("Welcome back, Admin!");
    } else {
      toast.error("Invalid password ❌");
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        setNewProduct(prev => ({ ...prev, imageUrl: base64 }));
        setUploading(false);
        toast.success("Image uploaded successfully!");
      };
      reader.onerror = () => {
        setUploading(false);
        toast.error("Failed to read file");
      };
    } catch (err) {
      setUploading(false);
      toast.error("Upload failed");
    }
  }

  async function handleAddProduct() {
    try {
      const url = isEditing ? `/api/products/${editingId}` : "/api/products";
      const method = isEditing ? "PATCH" : "POST";
      
      const body = { ...newProduct, shopId: 1 };
      const res = await fetch(url, { 
        method, 
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": "1" 
        }, 
        body: JSON.stringify(body) 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }
      
      toast.success(`Product ${isEditing ? 'updated' : 'added'} successfully!`);
      setNewProduct({ name: "", price: "", category: "", imageUrl: "" });
      setShowCreate(false);
      setIsEditing(false);
      setEditingId(null);
      fetchProducts();
    } catch (e: any) {
      console.error(`❌ [ADMIN] Error ${isEditing ? 'updating' : 'adding'} product:`, e);
      toast.error(e.message || `Failed to ${isEditing ? 'update' : 'add'} product`);
    }
  }

  async function handleEditProduct(p: any) {
    setNewProduct({
      name: p.name,
      price: p.price,
      category: p.category,
      imageUrl: p.imageUrl || ""
    });
    setEditingId(p.id);
    setIsEditing(true);
    setShowCreate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteProduct(id: number | string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": "1" }
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (e) {
      toast.error("Failed to delete product");
    }
  }

  async function handleAddOffer() {
    if (!newOffer.trim()) return;
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "1" },
        body: JSON.stringify({ content: newOffer, isActive: true })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to post news");
      }

      toast.success("News posted successfully!");
      
      // Clear Input
      setNewOffer("");
      setShowOfferCreate(false);
      
      // Automatic Refresh
      await fetchOffers();
    } catch (e: any) {
      toast.error(`Error: ${e.message || "Failed to create offer"}`);
    }
  }

  async function handleToggleOffer(o: Offer) {
    try {
      const res = await fetch(`/api/offers/${o.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": "1" },
        body: JSON.stringify({ isActive: !o.isActive })
      });
      if (!res.ok) throw new Error("Toggle failed");
      
      toast.info(o.isActive ? "News hidden" : "News shown");
      fetchOffers();
    } catch (e) {
      toast.error("Failed to update status");
    }
  }

  async function handleDeleteOffer(id: number) {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": "1" }
      });
      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("News deleted successfully");
      fetchOffers();
    } catch (e) {
      toast.error("Failed to delete news");
    }
  }

  function saveWaNumber() {
    localStorage.setItem("waNumber", waNumber);
    toast.success("WhatsApp number saved locally ✅");
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border rounded mb-3" />
          <button className="w-full bg-orange-500 text-white p-2 rounded" onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7F0] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded border">
            <div className="text-sm text-slate-500">Total Visitors</div>
            <div className="text-2xl font-bold text-orange-600">{visitors ?? '—'}</div>
          </div>
          <div className="p-4 bg-white rounded border">
            <div className="text-sm text-slate-500">Total Products</div>
            <div className="text-2xl font-bold text-orange-600">{products.length}</div>
          </div>
          <div className="p-4 bg-white rounded border">
            <div className="text-sm text-slate-500">WhatsApp</div>
            <div className="mt-2 flex gap-2 items-center">
              <input autoFocus className="flex-1 p-3 border rounded text-lg" placeholder="यहाँ अपना मोबाइल नंबर लिखें" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} />
              <button className="px-3 bg-orange-500 text-white rounded" onClick={saveWaNumber}>Save</button>
            </div>
            <div className="text-xs text-slate-500 mt-2">Saved to your browser localStorage</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Products</h2>
            <button className="text-sm text-orange-600" onClick={() => {
              if (showCreate) {
                setIsEditing(false);
                setEditingId(null);
                setNewProduct({ name: "", price: "", category: "", imageUrl: "" });
              }
              setShowCreate((s) => !s);
            }}>{showCreate ? 'Cancel' : 'Add Product'}</button>
          </div>

          {showCreate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="md:col-span-2 flex justify-between items-center border-b border-orange-200 pb-2 mb-2">
                <h3 className="font-black text-orange-800 uppercase tracking-wider">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h3>
                {isEditing && (
                  <span className="text-xs font-bold bg-orange-200 text-orange-800 px-2 py-1 rounded">
                    ID: #{editingId}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Product Name</label>
                <input placeholder="e.g. Fresh Mangoes" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} className="w-full p-2 border rounded bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Price (₹)</label>
                <input placeholder="e.g. 150" value={String(newProduct.price || '')} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} className="w-full p-2 border rounded bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Category</label>
                <input placeholder="e.g. Grocery" value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} className="w-full p-2 border rounded bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Product Image</label>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                {uploading && <div className="text-xs text-orange-600 animate-pulse">Processing image...</div>}
                {newProduct.imageUrl && !uploading && (
                  <div className="mt-2 h-20 w-20 rounded border overflow-hidden">
                    <img src={newProduct.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-200" 
                  onClick={handleAddProduct}
                  disabled={uploading}
                >
                  {uploading ? 'Wait...' : isEditing ? 'Update Product' : 'Add Product to Shop'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={String(p.id || p.name)} className="border-t">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.price}</td>
                    <td className="py-2">{p.category}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button className="text-blue-600 text-sm" onClick={() => handleEditProduct(p)}>Edit</button>
                        <button className="text-red-600 text-sm" onClick={() => p.id && handleDeleteProduct(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Offers & Market News Section */}
        <div className="bg-white p-4 rounded border mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Manage Offers & Market News</h2>
            <button 
              className="text-sm text-orange-600" 
              onClick={() => setShowOfferCreate((s) => !s)}
            >
              {showOfferCreate ? 'Cancel' : 'Add Offer/News'}
            </button>
          </div>

          {showOfferCreate && (
            <div className="mb-4">
              <textarea 
                placeholder="Type news like 'Today's special: 20% off at Sohagpur electronics'..." 
                value={newOffer} 
                onChange={(e) => setNewOffer(e.target.value)} 
                className="w-full p-3 border rounded h-24 mb-2"
              />
              <button 
                className="bg-orange-500 text-white px-6 py-2 rounded font-bold" 
                onClick={handleAddOffer}
              >
                Post News / Offer
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="py-2">Content</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-3 pr-4 text-sm">{o.content}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${o.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {o.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <div className="flex gap-3">
                        <button 
                          className="text-blue-600 text-sm font-medium" 
                          onClick={() => handleToggleOffer(o)}
                        >
                          {o.isActive ? 'Hide' : 'Show'}
                        </button>
                        <button 
                          className="text-red-600 text-sm font-medium" 
                          onClick={() => o.id && handleDeleteOffer(o.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {offers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                      No offers or news posted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { onAdminAuth } from "@/lib/admin";
import {
  getAllReviews,
  getReviewsByStatus,
  approveReview,
  deleteReview,
} from "@/lib/adminReviews";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  CheckCircle,
  Clock,
  LayoutDashboard,
  LogOut,
  Star,
} from "lucide-react";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
};

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">(
    "pending",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ---------- Auth ---------- */
  useEffect(() => {
    return onAdminAuth((ok) => {
      setIsAdmin(ok);
      setLoading(false);
    });
  }, []);

  /* ---------- Load reviews ---------- */
  useEffect(() => {
    if (!isAdmin) return;

    const fetchReviews = async () => {
      let data;
      if (filter === "all") data = await getAllReviews();
      else if (filter === "pending") data = await getReviewsByStatus(false);
      else data = await getReviewsByStatus(true);
      setReviews(data);
    };

    fetchReviews();
  }, [filter, isAdmin]);

  /* ---------- Login/Logout ---------- */
  const login = async () => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Invalid Admin Credentials");
    }
  };

  const logout = () => {
    const auth = getAuth();
    signOut(auth);
  };

  /* ---------- Actions ---------- */
  const approve = async (id: string) => {
    await approveReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const remove = async (id: string) => {
    if (!confirm("Kya aap is review ko delete karna chahte hain?")) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        <p className="font-bold text-slate-600 tracking-widest uppercase text-xs">
          Checking Access...
        </p>
      </div>
    );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-900 text-white text-center pb-8">
            <div className="mx-auto bg-orange-500 p-3 rounded-2xl w-fit mb-4">
              <LayoutDashboard size={32} />
            </div>
            <CardTitle className="text-2xl font-black uppercase">
              Admin Login
            </CardTitle>
            <CardDescription className="text-slate-400">
              ShahdolBazaar Control Panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-8">
            <input
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="w-full border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-xl shadow-lg shadow-orange-200"
              onClick={login}
            >
              ENTER DASHBOARD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
            Moderation
          </h1>
          <p className="text-slate-500 font-medium">
            Manage and verify customer reviews
          </p>
        </div>
        <Button
          variant="outline"
          onClick={logout}
          className="rounded-xl border-slate-200 hover:bg-red-50 hover:text-red-600 font-bold gap-2"
        >
          <LogOut size={18} /> Logout
        </Button>
      </div>

      {/* ---------- Filters ---------- */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mb-8 shadow-sm">
        {(["pending", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all uppercase tracking-wider ${
              filter === f
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ---------- Reviews List ---------- */}
      {reviews.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none rounded-[2rem]">
          <CardContent className="py-20 text-center">
            <p className="text-slate-400 font-bold italic">
              No {filter} reviews found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <Card
              key={r.id}
              className="rounded-3xl border-none shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
            >
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 capitalize">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 uppercase text-sm">
                          {r.name}
                        </div>
                        <div className="flex text-orange-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < r.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        r.approved
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }
                    >
                      {r.approved ? "LIVE" : "PENDING"}
                    </Badge>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed italic">
                    "{r.comment}"
                  </p>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-50">
                  {!r.approved && (
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl gap-2"
                      onClick={() => approve(r.id)}
                    >
                      <CheckCircle size={18} /> Approve
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="flex-1 text-red-500 hover:bg-red-50 font-bold rounded-xl gap-2"
                    onClick={() => remove(r.id)}
                  >
                    <Trash2 size={18} /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

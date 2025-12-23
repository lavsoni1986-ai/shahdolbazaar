import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/layout";
import AIChat from "@/components/AIChat"; // ✅ AI Assistant Import kiya

// Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Terms from "@/pages/terms";
import CategoryListing from "@/pages/category-listing";
import ShopDetail from "@/pages/shop-detail";
import Admin from "@/pages/admin";
import PartnerDashboard from "@/pages/partner-dashboard";
import AuthPage from "@/pages/auth";
import NotFound from "@/pages/not-found";
import Bus from "@/pages/bus";

/* ---------- ✅ AUTH HOOK ---------- */
interface User {
  id: string;
  name: string;
  role: "partner" | "admin";
}

const useAuth = (): { isAuthenticated: boolean; user: User | null } => {
  try {
    const user = localStorage.getItem("user");
    const userData = user ? (JSON.parse(user) as User) : null;
    return {
      isAuthenticated: !!userData,
      user: userData,
    };
  } catch {
    return { isAuthenticated: false, user: null };
  }
};

/* ---------- ✅ PROTECTED ROUTE ---------- */
interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

function ProtectedRoute({
  component: Component,
  ...rest
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const returnUrl = window.location.pathname;

  return (
    <Route {...rest}>
      {isAuthenticated ? (
        <Component />
      ) : (
        <Redirect to={`/auth?return=${encodeURIComponent(returnUrl)}`} />
      )}
    </Route>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location]);
  return null;
}

/* ---------- ✅ MAIN ROUTER ---------- */
function Router() {
  return (
    <Layout>
      <ScrollToTop />

      <Switch>
        {/* Public Pages */}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/terms" component={Terms} />
        <Route path="/bus" component={Bus} />
        <Route path="/category/:slug" component={CategoryListing} />
        <Route path="/shop/:id" component={ShopDetail} />
        <Route path="/auth" component={AuthPage} />

        {/* Protected Routes */}
        <ProtectedRoute path="/admin" component={Admin} />
        <ProtectedRoute
          path="/partner/dashboard"
          component={PartnerDashboard}
        />

        {/* 404 Page */}
        <Route component={NotFound} />
      </Switch>

      {/* ✅ Floating AI Chat - Ye har page par dikhega */}
      <AIChat />
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" richColors />
      <Router />
    </QueryClientProvider>
  );
}

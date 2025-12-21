import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Terms from "@/pages/terms";
import CategoryListing from "@/pages/category-listing";
import ShopDetail from "@/pages/shop-detail";
import Admin from "@/pages/admin";
import PartnerDashboard from "@/pages/partner-dashboard";
import AuthPage from "@/pages/auth"; // 🔑 Naya Login Page
import NotFound from "@/pages/not-found";

/* ---------- Authentication Check ---------- */
// Ye function check karega ki user login hai ya nahi
const useAuth = () => {
  const user = localStorage.getItem("user"); // Temporary logic for MVP
  return { isAuthenticated: !!user };
};

/* ---------- Protected Route Component ---------- */
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated } = useAuth();
  return (
    <Route {...rest}>
      {isAuthenticated ? <Component /> : <Redirect to="/auth" />}
    </Route>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

/* ---------- Router ---------- */
function Router() {
  return (
    <Layout>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/terms" component={Terms} />
        <Route path="/category/:slug" component={CategoryListing} />
        <Route path="/shop/:id" component={ShopDetail} />

        {/* Public Auth Page */}
        <Route path="/auth" component={AuthPage} />

        {/* 🔒 Protected Routes (Login Zaroori Hai) */}
        <ProtectedRoute path="/admin" component={Admin} />
        <ProtectedRoute
          path="/partner/dashboard"
          component={PartnerDashboard}
        />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

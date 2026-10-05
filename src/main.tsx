import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { WorkspaceProvider } from "./state/Workspace";
import AppLayout from "./components/AppLayout";
import { PublicLayout } from "./components/PublicLayout";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Products, ProductDetail } from "./pages/Products";
import {
  Acquisition,
  Alerts,
  Integrations,
  Settings,
  Billing,
} from "./pages/WorkspacePages";
import { Help, Legal, LegalDocument, NotFound } from "./pages/Information";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./styles.css";
import "./pwa";
function NavigationEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Every product. One clear view.",
      "/app": "Overview",
      "/app/products": "Products",
      "/app/acquisition": "Acquisition",
      "/app/alerts": "Insights & alerts",
      "/app/integrations": "Integrations",
      "/app/settings": "Workspace settings",
      "/app/billing": "Plan & billing",
      "/help": "Help center",
      "/privacy": "Privacy policy",
      "/terms": "Terms & conditions",
      "/legal": "Legal & notices",
    };
    document.title = `${titles[pathname] ?? (pathname.startsWith("/app/products/") ? "Product details" : "Page not found")} | ProductPulse`;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content =
      pathname.startsWith("/app") ||
      ["/privacy", "/terms", "/legal"].includes(pathname)
        ? "noindex,nofollow"
        : "index,follow";
    if (hash) {
      const timer = setTimeout(
        () =>
          document
            .getElementById(hash.slice(1))
            ?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <NavigationEffects />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="help" element={<Help />} />
          <Route path="privacy" element={<LegalDocument />} />
          <Route path="terms" element={<LegalDocument />} />
          <Route path="legal" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="app"
          element={
            <WorkspaceProvider>
              <AppLayout />
            </WorkspaceProvider>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="acquisition" element={<Acquisition />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="settings" element={<Settings />} />
          <Route path="billing" element={<Billing />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    {/* Vercel Web Analytics and Speed Insights: cookieless, first-party; no-ops outside Vercel. */}
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);

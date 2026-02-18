import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { login, isAuthenticated } from "@/lib/auth";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import InvoiceGenerator from "./pages/InvoiceGenerator";
import InvoiceHistory from "./pages/InvoiceHistory";
import SettingsPage from "./pages/SettingsPage";
import ClientPortal from "./pages/ClientPortal";
import NotFound from "./pages/NotFound";
import PublicStore from "./pages/PublicStore";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => {
  // Removed auto-login for production/client-facing deployment

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicStore />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes with Layout */}
            <Route path="/" element={<AppLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="clients" element={<Clients />} />
              <Route path="invoices" element={<InvoiceHistory />} />
              <Route path="invoices/new" element={<InvoiceGenerator />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="client-portal" element={<ClientPortal />} />
            </Route>

            {/* Wildcard 404 - Must be LAST */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

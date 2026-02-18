import React from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:hidden shrink-0">
            <SidebarTrigger />
            <div className="flex-1 font-semibold text-sm">KIM Inventory</div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;

import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { Toaster } from "./ui/toaster";
import { ServerStatus } from "./ServerStatus";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header />
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 pb-20 ml-[220px]">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
      <Toaster />
      <ServerStatus />
    </div>
  );
}
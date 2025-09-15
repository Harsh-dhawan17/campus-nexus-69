import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LoginPage onLogin={handleLogin} />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar user={user} onLogout={handleLogout} />
              <div className="flex-1 flex flex-col">
                <header className="h-14 flex items-center border-b bg-background px-6">
                  <SidebarTrigger />
                  <div className="ml-auto">
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString("en-US", { 
                        weekday: "long", 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}
                    </span>
                  </div>
                </header>
                <main className="flex-1 p-6 bg-background">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
                    <Route path="/attendance" element={<Attendance user={user} />} />
                    <Route path="/library" element={<Library user={user} />} />
                    <Route path="/hostel" element={<div>Hostel Management - Coming Soon</div>} />
                    <Route path="/events" element={<div>Event Management - Coming Soon</div>} />
                    <Route path="/complaints" element={<div>Complaint Management - Coming Soon</div>} />
                    <Route path="/users" element={<div>User Management - Coming Soon</div>} />
                    <Route path="/students" element={<div>Student Management - Coming Soon</div>} />
                    <Route path="/analytics" element={<div>Analytics - Coming Soon</div>} />
                    <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
                    <Route path="/profile" element={<div>Profile - Coming Soon</div>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

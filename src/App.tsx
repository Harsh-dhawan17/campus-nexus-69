import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthPage from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";
import HostelManagement from "./pages/HostelManagement";
import EventManagement from "./pages/EventManagement";
import ComplaintManagement from "./pages/ComplaintManagement";
import Profile from "./pages/Profile";
import QRScanner from "./pages/QRScanner";

const queryClient = new QueryClient();

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Smart Campus...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar user={profile} onLogout={signOut} />
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
              <Route path="/dashboard" element={<Dashboard user={profile} />} />
              <Route path="/attendance" element={<Attendance user={profile} />} />
              <Route path="/library" element={<Library user={profile} />} />
              <Route path="/hostel" element={<HostelManagement user={profile} />} />
              <Route path="/events" element={<EventManagement user={profile} />} />
              <Route path="/complaints" element={<ComplaintManagement user={profile} />} />
              <Route path="/qr-scanner" element={<QRScanner user={profile} />} />
              <Route path="/profile" element={<Profile user={profile} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

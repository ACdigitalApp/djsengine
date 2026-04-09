import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { I18nProvider } from "@/lib/i18n";
import DashboardPage from "./pages/Dashboard";
import LibraryPage from "./pages/Library";
import TrackDetailPage from "./pages/TrackDetail";
import CratesPage from "./pages/Crates";
import SourcesPage from "./pages/Sources";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/library" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/track/:id" element={<TrackDetailPage />} />
              <Route path="/crates" element={<CratesPage />} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;

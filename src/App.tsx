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
import AuthPage from "./pages/Auth";
import UserManagementPage from "./pages/UserManagement";
import BankDetailsPage from "./pages/BankDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<Navigate to="/library" replace />} />
            <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/library" element={<AppLayout><LibraryPage /></AppLayout>} />
            <Route path="/track/:id" element={<AppLayout><TrackDetailPage /></AppLayout>} />
            <Route path="/crates" element={<AppLayout><CratesPage /></AppLayout>} />
            <Route path="/sources" element={<AppLayout><SourcesPage /></AppLayout>} />
            <Route path="/users" element={<AppLayout><UserManagementPage /></AppLayout>} />
            <Route path="/bank" element={<AppLayout><BankDetailsPage /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;

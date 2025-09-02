import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewSearch from "./pages/NewSearch";
import SearchResults from "./pages/SearchResults";
import Shortlist from "./pages/Shortlist";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Search from "./pages/Search";
import Pipeline from "./pages/Pipeline";
import Team from "./pages/Team";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProjectProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/new-search" element={<NewSearch />} />
                      <Route path="/project/:projectId/results" element={<SearchResults />} />
                      <Route path="/project/:projectId/shortlist" element={<Shortlist />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/pipeline" element={<Pipeline />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/integrations" element={<Integrations />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

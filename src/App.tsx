import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
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
import Auth from "./pages/Auth";
import Projects from "./pages/Projects";
import TestCandidateDetails from "./pages/TestCandidateDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        <ProjectProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-search"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <NewSearch />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project/:projectId/results"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SearchResults />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project/:projectId/shortlist"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Shortlist />
                    </Layout>
                  </ProtectedRoute>
                }
              />
                <Route
                 path="/projects"
                 element={
                   <ProtectedRoute>
                     <Layout>
                       <Projects />
                     </Layout>
                   </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Analytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pipeline"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Pipeline />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Team />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/integrations"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Integrations />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Settings />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/test-candidate-details"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TestCandidateDetails />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
               <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </ProjectProvider>
      </AuthProvider>
    </NextThemeProvider>
  </QueryClientProvider>
);

export default App;

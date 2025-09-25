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
import OutreachAnalytics from "./pages/OutreachAnalytics";
import Search from "./pages/Search";
import Pipeline from "./pages/Pipeline";
import Team from "./pages/Team";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Projects from "./pages/Projects";
import Candidates from "./pages/Candidates";
import TestCandidateDetails from "./pages/TestCandidateDetails";
import EmailSequences from "./pages/EmailSequences";
import EmailSequenceDetails from "./pages/EmailSequenceDetails";
import GlobalTemplates from "./pages/GlobalTemplates";
import GlobalTemplateBuilder from "./pages/GlobalTemplateBuilder";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
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
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/new-search"
                element={
                  <Layout>
                    <NewSearch />
                  </Layout>
                }
              />
              <Route
                path="/project/:projectId/results"
                element={
                  <Layout>
                    <SearchResults />
                  </Layout>
                }
              />
              <Route
                path="/project/:projectId/shortlist"
                element={
                  <Layout>
                    <Shortlist />
                  </Layout>
                }
              />
               <Route
                path="/projects"
                element={
                  <Layout>
                    <Projects />
                  </Layout>
                }
              />
               <Route
                path="/candidates"
                element={
                  <Layout>
                    <Candidates />
                  </Layout>
                }
              />
              <Route
                path="/email-sequences"
                element={
                  <Layout>
                    <EmailSequences />
                  </Layout>
                }
              />
              <Route
                path="/email-sequences/:sequenceId"
                element={
                  <Layout>
                    <EmailSequenceDetails />
                  </Layout>
                }
              />
              <Route
                path="/outreach/templates"
                element={
                  <Layout>
                    <GlobalTemplates />
                  </Layout>
                }
              />
              <Route
                path="/outreach/templates/new"
                element={
                  <Layout>
                    <GlobalTemplateBuilder />
                  </Layout>
                }
              />
              <Route
                path="/outreach/templates/:templateId"
                element={
                  <Layout>
                    <GlobalTemplateBuilder />
                  </Layout>
                }
              />
        <Route 
          path="/analytics" 
          element={
            <Layout>
              <Analytics />
            </Layout>
          } 
        />
        <Route 
          path="/outreach/analytics" 
          element={
            <Layout>
              <OutreachAnalytics />
            </Layout>
          } 
        />
              <Route
                path="/pipeline"
                element={
                  <Layout>
                    <Pipeline />
                  </Layout>
                }
              />
              <Route
                path="/team"
                element={
                  <Layout>
                    <Team />
                  </Layout>
                }
              />
              <Route
                path="/integrations"
                element={
                  <Layout>
                    <Integrations />
                  </Layout>
                }
              />
              <Route
                path="/settings"
                element={
                  <Layout>
                    <Settings />
                  </Layout>
                }
              />
              <Route
                path="/test-candidate-details"
                element={
                  <Layout>
                    <TestCandidateDetails />
                  </Layout>
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
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

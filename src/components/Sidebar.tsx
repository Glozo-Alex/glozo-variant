import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Search, Kanban, Users, BarChart3, Plug, Settings, ChevronLeft, ChevronRight, List, Plus, FolderOpen, LogOut, User, Mail, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import ProjectSelector from "./ProjectSelector";
import ColorSchemeSelector from "./ColorSchemeSelector";
import { UIDensityToggle } from "./UIDensityToggle";
import { useColorScheme } from "@/contexts/ThemeContext";
import { useSidebarState } from "@/hooks/useSidebarState";

const Sidebar = () => {
  const { collapsed, toggleCollapsed } = useSidebarState();
  const [outreachExpanded, setOutreachExpanded] = useState(true);
  const { activeProject } = useProject();
  const { user, signOut } = useAuth();
  const { profile, displayName } = useProfile();
  const { uiDensity } = useColorScheme();
  const location = useLocation();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  const navCls = "flex items-center gap-[var(--ui-spacing-sm)] px-[var(--ui-spacing-sm)] py-[var(--ui-spacing-xs)] rounded-[var(--ui-border-radius-sm)] text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-all duration-300 hover-scale";
  const subNavCls = "flex items-center gap-[var(--ui-spacing-sm)] px-[var(--ui-spacing-sm)] py-[var(--ui-spacing-xs)] ml-6 rounded-[var(--ui-border-radius-sm)] text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-all duration-300 hover-scale";

  // Check if any outreach route is active
  const isOutreachActive = location.pathname.startsWith('/email-sequences') || location.pathname.startsWith('/outreach');

  return (
    <TooltipProvider>
      <aside className={`${collapsed ? "w-16" : "w-64"} ${uiDensity === 'compact' ? 'bg-background border-r border-border' : 'glass-sidebar'} h-screen flex flex-col transition-[width] duration-200 animate-slide-in-left`}>
        {/* Header with centered logo */}
        <div className="h-14 flex items-center justify-center px-2">
          <img
            src={collapsed ? "/lovable-uploads/3958ba4b-ab9f-4bc4-9677-5bc99ead0c0a.png" : "/lovable-uploads/fc31fa24-db3f-423a-b235-da6a49bb2bdd.png"}
            alt={collapsed ? "GLOZO mark logo (orange FC5B26)" : "GLOZO logo (orange FC5B26)"}
            className={`${collapsed ? "h-6 w-6" : "h-8 w-auto"} object-contain`}
            loading="lazy"
          />
        </div>

        {/* Primary nav - Top section */}
        <nav className="px-3 pt-3 space-y-1">
          <NavLink to="/" className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                     <LayoutDashboard className="h-[var(--ui-icon-md)] w-[var(--ui-icon-md)]" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Dashboard</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <LayoutDashboard className="h-[var(--ui-icon-md)] w-[var(--ui-icon-md)]" />
                <span>Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink to="/new-search" className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">New Search</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>New Search</span>
              </>
            )}
          </NavLink>

          {/* Current Project section - appears right after New Search */}
          {activeProject && !collapsed && (
            <div className="space-y-1 mt-4">
              <div className="text-xs font-medium text-sidebar-text uppercase tracking-wider mb-2 px-3">
                Current Project
              </div>
              <div className="space-y-1 px-3">
                <ProjectSelector />
                
                <NavLink 
                  to={`/project/${activeProject.id}/shortlist`} 
                  className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}
                >
                  <List className="h-5 w-5" />
                  <span>Shortlist ({activeProject.shortlistCount || 0})</span>
                </NavLink>
              </div>
            </div>
          )}

          <NavLink to="/projects" className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Projects</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <FolderOpen className="h-5 w-5" />
                <span>Projects</span>
              </>
            )}
          </NavLink>

          {/* Outreach Section */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`${navCls} ${isOutreachActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
                  <div className="flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="space-y-1">
                  <div className="font-medium">Outreach</div>
                  <div className="text-xs">Sequences • Templates • Analytics</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => setOutreachExpanded(!outreachExpanded)}
                className={`${navCls} w-full justify-between ${isOutreachActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5" />
                  <span>Outreach</span>
                </div>
                {outreachExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {outreachExpanded && (
                <div className="space-y-1">
                  <NavLink to="/email-sequences" className={({ isActive }) => `${subNavCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
                    <Mail className="h-4 w-4" />
                    <span>Sequences</span>
                  </NavLink>
                  
                  <NavLink to="/outreach/templates" className={({ isActive }) => `${subNavCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
                    <FileText className="h-4 w-4" />
                    <span>Global Templates</span>
                  </NavLink>
                  
                  <NavLink to="/outreach/analytics" className={({ isActive }) => `${subNavCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Separator before Pipeline/Analytics */}
        <div className="px-3 mt-6">
          <div className="h-px bg-sidebar-border/50"></div>
        </div>

        {/* Bottom navigation */}
        <nav className="px-3 mt-6 space-y-1">
          <NavLink to="/pipeline" className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <Kanban className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Pipeline</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Kanban className="h-5 w-5" />
                <span>Pipeline</span>
              </>
            )}
          </NavLink>

          <NavLink to="/analytics" className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Analytics</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <BarChart3 className="h-5 w-5" />
                <span>Analytics</span>
              </>
            )}
          </NavLink>

        </nav>

        {/* System navigation */}
        <nav className="px-3 mt-6 space-y-1">
          <NavLink to="/team" className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Team</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Users className="h-5 w-5" />
                <span>Team</span>
              </>
            )}
          </NavLink>

          <NavLink to="/integrations" className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <Plug className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Integrations</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Plug className="h-5 w-5" />
                <span>Integrations</span>
              </>
            )}
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <Settings className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Collapse button at bottom */}
        <div className="mt-auto p-4 space-y-3">
          {/* Theme Controls */}
          <div className={`flex ${collapsed ? 'flex-col space-y-2' : 'gap-2'}`}>
            <ColorSchemeSelector collapsed={collapsed} />
            {!collapsed && <UIDensityToggle />}
          </div>
          
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-full h-10 rounded-lg bg-sidebar-hover text-sidebar-text hover:bg-sidebar-accent hover:text-sidebar-text-active flex items-center justify-center transition-all duration-300 hover-scale"
            onClick={toggleCollapsed}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          
          {/* User Profile Section */}
          {user && (
            <div className={`rounded-lg border border-sidebar-border glass-card ${collapsed ? "p-2" : "p-3"}`}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink 
                      to="/settings" 
                      className="flex items-center justify-center w-full group"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-sidebar-accent/50 group-hover:ring-sidebar-accent transition-all">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-center">
                      <div className="font-medium">{displayName}</div>
                      {profile?.job_title && (
                        <div className="text-xs text-muted-foreground">{profile.job_title}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">Click for settings</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="space-y-3">
                  <NavLink 
                    to="/settings" 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-hover transition-colors group"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-sidebar-accent/50 group-hover:ring-sidebar-accent transition-all">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-sidebar-text-active truncate">{displayName}</div>
                      {profile?.job_title && (
                        <div className="text-xs text-sidebar-text truncate">{profile.job_title}</div>
                      )}
                    </div>
                  </NavLink>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={signOut}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
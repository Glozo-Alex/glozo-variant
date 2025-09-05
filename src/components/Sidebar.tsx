import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Search, Kanban, Users, BarChart3, Plug, Settings, ChevronLeft, ChevronRight, List, Plus, FolderOpen, LogOut, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import ProjectSelector from "./ProjectSelector";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { activeProject } = useProject();
  const { user, signOut } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const navCls = "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-all duration-300 hover-scale";

  return (
    <TooltipProvider>
      <aside className={`${collapsed ? "w-20" : "w-64"} glass-sidebar h-screen flex flex-col transition-[width] duration-200 animate-slide-in-left`}>
        {/* Header with centered logo */}
        <div className="h-14 flex items-center justify-center px-2">
          <img
            src={collapsed ? "/lovable-uploads/3958ba4b-ab9f-4bc4-9677-5bc99ead0c0a.png" : "/lovable-uploads/fc31fa24-db3f-423a-b235-da6a49bb2bdd.png"}
            alt={collapsed ? "GLOZO mark logo (orange FC5B26)" : "GLOZO logo (orange FC5B26)"}
            className={`${collapsed ? "h-8 w-8" : "h-8 w-auto"} object-contain`}
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
                    <LayoutDashboard className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Dashboard</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </>
            )}
          </NavLink>

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
        </nav>

        {/* Project section - Dynamic */}
        {activeProject && !collapsed && (
          <div className="px-3 mt-6">
            <div className="text-xs font-medium text-sidebar-text uppercase tracking-wider mb-2">
              Current Project
            </div>
            <div className="space-y-1">
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
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-full h-10 rounded-lg bg-sidebar-hover text-sidebar-text hover:bg-sidebar-accent hover:text-sidebar-text-active flex items-center justify-center transition-all duration-300 hover-scale"
            onClick={() => setCollapsed((v) => !v)}
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
                      <div className="text-xs text-muted-foreground">{user.email}</div>
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
                      <div className="text-xs text-sidebar-text truncate">{user.email}</div>
                    </div>
                    <User className="h-4 w-4 text-sidebar-text opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
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
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Search, Kanban, Users, BarChart3, Plug, Settings, ChevronLeft, ChevronRight, Folder, List, MessageSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

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

        {/* Primary nav */}
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

          <NavLink to="/search" className={({ isActive }) => `${navCls} ${isActive ? 'bg-sidebar-accent text-sidebar-text-active' : ''}`}>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <Search className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Smart Search</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Smart Search</span>
              </>
            )}
          </NavLink>

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

        {/* Secondary nav */}
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
          
          {/* User */}
          <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border border-sidebar-border glass-card ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-sidebar-hover flex items-center justify-center text-sm font-medium text-sidebar-text-active">A</div>
            {!collapsed && <div className="text-sm font-medium text-sidebar-text-active">Ana Ivanova</div>}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
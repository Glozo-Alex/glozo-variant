import { useState } from "react";
import { LayoutDashboard, Search, List, MessageSquare, Folder, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navCls = "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-all duration-300 hover-scale";

  return (
    <TooltipProvider>
      <aside className={`${collapsed ? "w-20" : "w-64"} glass-sidebar h-screen flex flex-col transition-[width] duration-200 animate-slide-in-left`}>
        {/* Header with centered logo */}
        <div className="h-14 border-b border-sidebar-border/30 flex items-center justify-center px-2">
          <img
            src={collapsed ? "/lovable-uploads/3958ba4b-ab9f-4bc4-9677-5bc99ead0c0a.png" : "/lovable-uploads/fc31fa24-db3f-423a-b235-da6a49bb2bdd.png"}
            alt={collapsed ? "GLOZO mark logo (orange FC5B26)" : "GLOZO logo (orange FC5B26)"}
            className={`${collapsed ? "h-8 w-8" : "h-8 w-auto"} object-contain`}
            loading="lazy"
          />
        </div>

        {/* Primary nav */}
        <nav className="px-3 pt-3 space-y-1">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a className={`${navCls} justify-center`} href="#">
                  <LayoutDashboard className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Home</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <a className={navCls} href="#">
              <LayoutDashboard className="h-5 w-5" />
              <span>Home</span>
            </a>
          )}
          
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a className={`${navCls} justify-center`} href="#">
                  <Search className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>New Search</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <a className={navCls} href="#">
              <Search className="h-5 w-5" />
              <span>New Search</span>
            </a>
          )}
        </nav>

        {/* Project group */}
        <div className="px-3 mt-4">
          <div className="px-3 py-2 rounded-lg border border-sidebar-border glass-card">
            <div className="flex items-center gap-3 mb-2">
              <Folder className="h-4 w-4 text-sidebar-text" />
              {!collapsed && <span className="text-sm font-medium text-sidebar-text-active truncate">Senior Data S...</span>}
            </div>
            <div className="flex flex-col gap-1">
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a className="flex items-center justify-center px-3 py-2 rounded-md text-sm bg-tag-purple text-tag-purple-text" href="#">
                      <Search className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Sourcing</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-tag-purple text-tag-purple-text" href="#">
                  <Search className="h-4 w-4" />
                  <span>Sourcing</span>
                </a>
              )}
              
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a className={`${navCls} justify-center`} href="#">
                      <List className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Shortlist</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <a className={navCls} href="#">
                  <List className="h-4 w-4" />
                  <span>Shortlist</span>
                </a>
              )}
              
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a className={`${navCls} justify-center`} href="#">
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Outreach</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <a className={navCls} href="#">
                  <MessageSquare className="h-4 w-4" />
                  <span>Outreach</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Secondary nav */}
        <nav className="px-3 mt-4 space-y-1">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a className={`${navCls} justify-center`} href="#">
                  <Folder className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Projects</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <a className={navCls} href="#">
              <Folder className="h-5 w-5" />
              <span>Projects</span>
            </a>
          )}
          
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a className={`${navCls} justify-center`} href="#">
                  <Users className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Candidates</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <a className={navCls} href="#">
              <Users className="h-5 w-5" />
              <span>Candidates</span>
            </a>
          )}
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
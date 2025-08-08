import { useState } from "react";
import { LayoutDashboard, Search, List, MessageSquare, Folder, Users, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navCls = "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active transition-colors hover-scale";

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} bg-sidebar-bg border-r border-sidebar-border h-screen flex flex-col transition-[width] duration-200`}> 
      {/* Header with centered logo and collapse toggle */}
      <div className="h-14 border-b border-sidebar-border relative flex items-center justify-center px-2">
        <img
          src={collapsed ? "/lovable-uploads/3958ba4b-ab9f-4bc4-9677-5bc99ead0c0a.png" : "/lovable-uploads/fc31fa24-db3f-423a-b235-da6a49bb2bdd.png"}
          alt={collapsed ? "GLOZO mark logo (orange FC5B26)" : "GLOZO logo (orange FC5B26)"}
          className={`${collapsed ? "h-8 w-8" : "h-8 w-auto"} object-contain`}
          loading="lazy"
        />
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground/70 hover:opacity-90 transition"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Primary nav */}
      <nav className="px-3 pt-3 space-y-1">
        <a className={navCls} href="#">
          <LayoutDashboard className="h-5 w-5" />
          {!collapsed && <span>Home</span>}
        </a>
        <a className={navCls} href="#">
          <Search className="h-5 w-5" />
          {!collapsed && <span>New Search</span>}
        </a>
      </nav>

      {/* Project group */}
      <div className="px-3 mt-4">
        <div className="px-3 py-2 rounded-lg border border-sidebar-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Folder className="h-4 w-4 text-sidebar-text" />
            {!collapsed && <span className="text-sm font-medium text-foreground truncate">Senior Data S...</span>}
          </div>
          <div className="flex flex-col gap-1">
            <a className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-tag-purple text-tag-purple-text ${collapsed ? "justify-center" : ""}`} href="#">
              <Search className="h-4 w-4" />
              {!collapsed && <span>Sourcing</span>}
            </a>
            <a className={`${navCls} ${collapsed ? "justify-center" : ""}`} href="#">
              <List className="h-4 w-4" />
              {!collapsed && <span>Shortlist</span>}
            </a>
            <a className={`${navCls} ${collapsed ? "justify-center" : ""}`} href="#">
              <MessageSquare className="h-4 w-4" />
              {!collapsed && <span>Outreach</span>}
            </a>
          </div>
        </div>
      </div>

      {/* Secondary nav */}
      <nav className="px-3 mt-4 space-y-1">
        <a className={navCls + (collapsed ? " justify-center" : "")} href="#">
          <Folder className="h-5 w-5" />
          {!collapsed && <span>Projects</span>}
        </a>
        <a className={navCls + (collapsed ? " justify-center" : "")} href="#">
          <Users className="h-5 w-5" />
          {!collapsed && <span>Candidates</span>}
        </a>
      </nav>

      {/* User */}
      <div className="mt-auto p-4">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border border-sidebar-border bg-card ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">A</div>
          {!collapsed && <div className="text-sm font-medium text-foreground">Ana Ivanova</div>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
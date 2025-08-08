import { Home, Plus, Search, List, MessageCircle, Folder, Users } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-sidebar-bg border-r border-sidebar-border h-screen flex flex-col">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
            <span className="text-background text-sm font-bold">G</span>
          </div>
          <span className="font-extrabold tracking-tight text-foreground">GLOZO</span>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="px-3 pt-4 space-y-1">
        <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active" href="#">
          <Home className="h-5 w-5" />
          <span>Home</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active" href="#">
          <Plus className="h-5 w-5" />
          <span>New Search</span>
        </a>
      </nav>

      {/* Project group */}
      <div className="px-3 mt-4">
        <div className="px-3 py-2 rounded-lg border border-sidebar-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Folder className="h-4 w-4 text-sidebar-text" />
            <span className="text-sm font-medium text-foreground truncate">Senior Data S...</span>
          </div>
          <div className="flex flex-col gap-1">
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-tag-purple text-tag-purple-text" href="#">
              <Search className="h-4 w-4" />
              <span>Sourcing</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active" href="#">
              <List className="h-4 w-4" />
              <span>Shortlist</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active" href="#">
              <MessageCircle className="h-4 w-4" />
              <span>Outreach</span>
            </a>
          </div>
        </div>
      </div>

      {/* Secondary nav */}
      <nav className="px-3 mt-4 space-y-1">
        <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active" href="#">
          <Folder className="h-5 w-5" />
          <span>Projects</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active" href="#">
          <Users className="h-5 w-5" />
          <span>Candidates</span>
        </a>
      </nav>

      {/* User */}
      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-sidebar-border bg-card">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">A</div>
          <div className="text-sm font-medium text-foreground">Ana Ivanova</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
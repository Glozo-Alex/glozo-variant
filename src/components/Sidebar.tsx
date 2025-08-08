import { Home, Plus, Search, List, MessageCircle, Folder, Users } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: "Home", active: false },
    { icon: Plus, label: "New Search", active: false },
    { icon: Folder, label: "Senior Data S...", active: false },
    { icon: Search, label: "Sourcing", active: true },
    { icon: List, label: "Shortlist", active: false },
    { icon: MessageCircle, label: "Outreach", active: false },
    { icon: Folder, label: "Projects", active: false },
    { icon: Users, label: "Candidates", active: false },
  ];

  return (
    <div className="w-64 bg-sidebar-bg border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
            <span className="text-background font-bold text-sm">G</span>
          </div>
          <span className="font-bold text-xl text-foreground">GLOZO</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
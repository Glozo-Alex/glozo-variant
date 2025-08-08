import { useState } from "react";
import { 
  Home, 
  Search, 
  Users, 
  MessageSquare, 
  Target, 
  FolderOpen, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  icon: any;
  label: string;
  badge?: number;
  isActive?: boolean;
  gradient?: boolean;
}

const primaryNav: NavItem[] = [
  { icon: Home, label: "Home", isActive: true },
  { icon: Search, label: "New Search", gradient: true },
];

const projectNav: NavItem[] = [
  { icon: Target, label: "Sourcing", badge: 5 },
  { icon: Users, label: "Shortlist", badge: 12 },
  { icon: MessageSquare, label: "Outreach", badge: 3 },
];

const secondaryNav: NavItem[] = [
  { icon: FolderOpen, label: "Projects" },
  { icon: Users, label: "Candidates" },
];

const ModernSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const NavButton = ({ item, showTooltip = false }: { item: NavItem; showTooltip?: boolean }) => {
    const content = (
      <Button
        variant={item.isActive ? "default" : "ghost"}
        size={collapsed ? "icon" : "sm"}
        className={`
          w-full justify-start gap-3 relative group h-11
          ${item.isActive 
            ? "bg-gradient-primary text-white shadow-glow border-0" 
            : "hover:bg-sidebar-hover text-sidebar-text hover:text-sidebar-text-active"
          }
          ${item.gradient && !item.isActive 
            ? "hover:bg-gradient-primary hover:text-white hover:shadow-glow transition-all duration-300" 
            : ""
          }
          ${collapsed ? "px-0" : "px-4"}
        `}
      >
        <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : ""}`} />
        {!collapsed && (
          <>
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-primary-glow text-white text-xs rounded-full px-2 py-0.5 min-w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Button>
    );

    if (showTooltip && collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
            {item.badge && ` (${item.badge})`}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <aside className={`
        glass-sidebar h-screen flex flex-col transition-all duration-300 ease-in-out relative
        ${collapsed ? "w-20" : "w-72"}
      `}>
        {/* Header with logo */}
        <div className={`flex items-center gap-3 p-6 border-b border-sidebar-border/30 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-gradient">TalentAI</h1>
              <p className="text-xs text-sidebar-text">Smart Recruiting</p>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 p-4 space-y-6">
          {/* Primary Actions */}
          <div className="space-y-2">
            {primaryNav.map((item, index) => (
              <NavButton key={index} item={item} showTooltip={collapsed} />
            ))}
          </div>

          {/* AI Assistant - Floating Action */}
          <div className="relative">
            <Button 
              size={collapsed ? "icon" : "sm"}
              className={`
                w-full bg-gradient-primary text-white shadow-glow hover:shadow-xl
                hover-lift border-0 h-11
                ${collapsed ? "px-0" : "justify-start gap-3 px-4"}
              `}
            >
              <Plus className={`h-5 w-5 ${collapsed ? "mx-auto" : ""}`} />
              {!collapsed && <span className="font-medium">AI Assistant</span>}
            </Button>
          </div>

          {/* Project Group */}
          <div className="space-y-3">
            {!collapsed && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold text-sidebar-text uppercase tracking-wider">
                  Current Project
                </span>
                <div className="h-px bg-sidebar-border flex-1"></div>
              </div>
            )}
            <div className="space-y-1">
              {projectNav.map((item, index) => (
                <NavButton key={index} item={item} showTooltip={collapsed} />
              ))}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="space-y-3">
            {!collapsed && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-semibold text-sidebar-text uppercase tracking-wider">
                  Library
                </span>
                <div className="h-px bg-sidebar-border flex-1"></div>
              </div>
            )}
            <div className="space-y-1">
              {secondaryNav.map((item, index) => (
                <NavButton key={index} item={item} showTooltip={collapsed} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-sidebar-border/30 space-y-4">
          {/* User Info */}
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-text-active truncate">John Doe</p>
                <p className="text-xs text-sidebar-text truncate">Talent Acquisition</p>
              </div>
            )}
          </div>

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full hover:bg-sidebar-hover text-sidebar-text hover:text-sidebar-text-active"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default ModernSidebar;
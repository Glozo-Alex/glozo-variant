import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Search, 
  Kanban, 
  Users, 
  BarChart3, 
  Plug, 
  Settings, 
  List, 
  Plus, 
  FolderOpen, 
  LogOut, 
  User, 
  Mail, 
  FileText, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import ProjectSelector from "./ProjectSelector";
import ColorSchemeSelector from "./ColorSchemeSelector";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const AppSidebar = () => {
  const [outreachExpanded, setOutreachExpanded] = useState(true);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { activeProject } = useProject();
  const { user, signOut } = useAuth();
  const { profile, displayName } = useProfile();
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

  // Check if any outreach route is active
  const isOutreachActive = location.pathname.startsWith('/email-sequences') || location.pathname.startsWith('/outreach');

  return (
    <Sidebar className="glass-sidebar backdrop-blur-xl border-r border-sidebar-border/50" collapsible="icon">
      <SidebarHeader className="h-14 flex items-center justify-center px-2 border-b border-sidebar-border/30">
        <img
          src={collapsed ? "/lovable-uploads/3958ba4b-ab9f-4bc4-9677-5bc99ead0c0a.png" : "/lovable-uploads/fc31fa24-db3f-423a-b235-da6a49bb2bdd.png"}
          alt={collapsed ? "GLOZO mark logo (orange FC5B26)" : "GLOZO logo (orange FC5B26)"}
          className={`${collapsed ? "h-8 w-8" : "h-8 w-auto"} object-contain`}
          loading="lazy"
        />
      </SidebarHeader>

      <SidebarContent>
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/new-search">
                  <Plus className="h-5 w-5" />
                  <span>New Search</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Current Project Section */}
        {activeProject && !collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Current Project</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2">
                <ProjectSelector />
              </div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to={`/project/${activeProject.id}/shortlist`}>
                      <List className="h-5 w-5" />
                      <span>Shortlist ({activeProject.shortlistCount || 0})</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Projects and Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/projects">
                  <FolderOpen className="h-5 w-5" />
                  <span>Projects</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/candidates">
                  <Users className="h-5 w-5" />
                  <span>Candidates</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Outreach Collapsible Section */}
            <Collapsible open={outreachExpanded} onOpenChange={setOutreachExpanded}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      <span>Outreach</span>
                    </div>
                    {outreachExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/email-sequences">
                          <Mail className="h-4 w-4" />
                          <span>Sequences</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/outreach/templates">
                          <FileText className="h-4 w-4" />
                          <span>Global Templates</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild>
                        <NavLink to="/outreach/analytics">
                          <BarChart3 className="h-4 w-4" />
                          <span>Analytics</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/pipeline">
                  <Kanban className="h-5 w-5" />
                  <span>Pipeline</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/analytics">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* System Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/team">
                  <User className="h-5 w-5" />
                  <span>Team</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/integrations">
                  <Plug className="h-5 w-5" />
                  <span>Integrations</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/settings">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        {/* Color Scheme Selector */}
        <ColorSchemeSelector collapsed={collapsed} />
        
        {/* User Profile Section */}
        {user && (
          <div className={`rounded-lg border border-sidebar-border glass-card ${collapsed ? "p-2" : "p-3"}`}>
            {collapsed ? (
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
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
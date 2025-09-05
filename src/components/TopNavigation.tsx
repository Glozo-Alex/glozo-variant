import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  List, 
  Kanban, 
  BarChart3, 
  Users, 
  Plug, 
  Settings,
  FolderOpen
} from 'lucide-react';


const TopNavigation = () => {
  const location = useLocation();
  const { projectId } = useParams();
  const { projects, activeProject } = useProject();
  
  const currentProject = projectId ? projects.find(p => p.id === projectId) : activeProject;

  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return {
        icon: LayoutDashboard,
        title: 'Dashboard',
        breadcrumbs: [{ label: 'Dashboard', href: '/' }]
      };
    }
    
    if (path === '/new-search') {
      return {
        icon: Plus,
        title: 'New Search',
        subtitle: 'Create a new candidate search project',
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'New Search' }
        ]
      };
    }
    
    if (path.includes('/project/') && path.includes('/results')) {
      return {
        icon: Search,
        title: 'Search Results',
        subtitle: currentProject?.name,
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/' },
          { label: currentProject?.name || 'Project' }
        ]
      };
    }
    
    if (path.includes('/project/') && path.includes('/shortlist')) {
      return {
        icon: List,
        title: 'Shortlist',
        subtitle: currentProject?.name,
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: '/' },
          { label: currentProject?.name || 'Project', href: `/project/${projectId}/results` },
          { label: 'Shortlist' }
        ]
      };
    }
    
    if (path === '/analytics') {
      return {
        icon: BarChart3,
        title: 'Analytics',
        subtitle: 'Performance metrics and insights',
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Analytics' }
        ]
      };
    }
    
    if (path === '/search') {
      return {
        icon: Search,
        title: 'Smart Search',
        subtitle: 'Advanced candidate search',
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Smart Search' }
        ]
      };
    }
    
    if (path === '/pipeline') {
      return {
        icon: Kanban,
        title: 'Pipeline',
        subtitle: 'Hiring pipeline management',
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Pipeline' }
        ]
      };
    }
    
    if (path === '/team') {
      return {
        icon: Users,
        title: 'Team',
        subtitle: 'Team management and collaboration',
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Team' }
        ]
      };
    }
    
    if (path === '/integrations') {
      return {
        icon: Plug,
        title: 'Integrations',
        subtitle: 'Connect with external tools',
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Integrations' }
        ]
      };
    }
    
    if (path === '/settings') {
      return {
        icon: Settings,
        title: 'Settings',
        subtitle: 'Account and application settings',
        breadcrumbs: [
          { label: 'Dashboard', href: '/' },
          { label: 'Settings' }
        ]
      };
    }
    
    return {
      icon: LayoutDashboard,
      title: 'Unknown Page',
      breadcrumbs: [{ label: 'Dashboard', href: '/' }]
    };
  };

  const pageInfo = getPageInfo();
  const Icon = pageInfo.icon;

  return (
    <header className="glass-surface border-b border-sidebar-border px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumbs only */}
        <div className="flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              {pageInfo.breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-foreground">
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < pageInfo.breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center gap-3">
          {/* Active project indicator */}
          {activeProject && !location.pathname.includes('/project/') && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/5 border border-primary/20">
              <FolderOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{activeProject.name}</span>
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            </div>
          )}
          
          {/* Project count */}
          {projects.length > 0 && (
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {/* Current time */}
          <div className="hidden xl:block text-sm text-muted-foreground">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
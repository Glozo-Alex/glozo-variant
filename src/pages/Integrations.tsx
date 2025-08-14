import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plug, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  ExternalLink,
  Zap,
  Database,
  Mail,
  Calendar,
  MessageSquare,
  Github,
  Linkedin
} from "lucide-react";

const Integrations = () => {
  const [integrations, setIntegrations] = useState({
    linkedin: { enabled: true, status: "connected" },
    github: { enabled: true, status: "connected" },
    gmail: { enabled: false, status: "disconnected" },
    slack: { enabled: true, status: "connected" },
    greenhouse: { enabled: false, status: "disconnected" },
    workday: { enabled: false, status: "disconnected" },
    calendly: { enabled: true, status: "connected" },
    zoom: { enabled: true, status: "connected" }
  });

  const toggleIntegration = (key: string) => {
    setIntegrations(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof typeof prev],
        enabled: !prev[key as keyof typeof prev].enabled,
        status: !prev[key as keyof typeof prev].enabled ? "connected" : "disconnected"
      }
    }));
  };

  const availableIntegrations = [
    {
      id: "linkedin",
      name: "LinkedIn Recruiter",
      category: "sourcing",
      description: "Import candidates and sync profiles from LinkedIn Recruiter",
      icon: Linkedin,
      features: ["Profile import", "InMail sync", "Company insights"],
      pricing: "Premium feature"
    },
    {
      id: "github",
      name: "GitHub",
      category: "sourcing", 
      description: "Discover developers and analyze code contributions",
      icon: Github,
      features: ["Developer profiles", "Code analysis", "Contribution graphs"],
      pricing: "Free"
    },
    {
      id: "gmail",
      name: "Gmail",
      category: "communication",
      description: "Sync email communications with candidate profiles",
      icon: Mail,
      features: ["Email sync", "Template automation", "Response tracking"],
      pricing: "Free"
    },
    {
      id: "slack",
      name: "Slack",
      category: "communication",
      description: "Get real-time notifications and team collaboration",
      icon: MessageSquare,
      features: ["Instant notifications", "Team channels", "Status updates"],
      pricing: "Free"
    },
    {
      id: "greenhouse",
      name: "Greenhouse",
      category: "ats",
      description: "Sync candidates and job postings with Greenhouse ATS",
      icon: Database,
      features: ["Candidate sync", "Job posting sync", "Interview scheduling"],
      pricing: "Premium feature"
    },
    {
      id: "workday",
      name: "Workday",
      category: "ats",
      description: "Enterprise HR integration with Workday platform",
      icon: Database,
      features: ["Employee data", "Position management", "Reporting sync"],
      pricing: "Enterprise"
    },
    {
      id: "calendly",
      name: "Calendly", 
      category: "scheduling",
      description: "Automated interview scheduling and calendar management",
      icon: Calendar,
      features: ["Auto-scheduling", "Calendar sync", "Interview reminders"],
      pricing: "Free"
    },
    {
      id: "zoom",
      name: "Zoom",
      category: "scheduling",
      description: "Video interview integration and meeting management",
      icon: Calendar,
      features: ["Video interviews", "Recording", "Meeting links"],
      pricing: "Free"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "sourcing":
        return "bg-blue-100 text-blue-800";
      case "communication":
        return "bg-green-100 text-green-800";
      case "ats":
        return "bg-purple-100 text-purple-800";
      case "scheduling":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const connectedIntegrations = availableIntegrations.filter(
    integration => integrations[integration.id as keyof typeof integrations]?.enabled
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground">Connect your favorite tools and streamline your workflow</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plug className="h-4 w-4" />
          Browse All
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            <p className="text-2xl font-bold mt-1">{connectedIntegrations.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Available</span>
            </div>
            <p className="text-2xl font-bold mt-1">{availableIntegrations.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Data Synced</span>
            </div>
            <p className="text-2xl font-bold mt-1">2.4K</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Active Workflows</span>
            </div>
            <p className="text-2xl font-bold mt-1">12</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="sourcing">Sourcing</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="ats">ATS Systems</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableIntegrations.map((integration) => {
              const integrationState = integrations[integration.id as keyof typeof integrations];
              return (
                <Card key={integration.id} className="card-interactive">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/50">
                          <integration.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <Badge className={getCategoryColor(integration.category)} variant="outline">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integrationState?.status || "disconnected")}
                        <Switch
                          checked={integrationState?.enabled || false}
                          onCheckedChange={() => toggleIntegration(integration.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{integration.pricing}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {["sourcing", "communication", "ats", "scheduling"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableIntegrations
                .filter((integration) => integration.category === category)
                .map((integration) => {
                  const integrationState = integrations[integration.id as keyof typeof integrations];
                  return (
                    <Card key={integration.id} className="card-interactive">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-accent/50">
                              <integration.icon className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(integrationState?.status || "disconnected")}
                            <Switch
                              checked={integrationState?.enabled || false}
                              onCheckedChange={() => toggleIntegration(integration.id)}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                        
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-foreground">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{integration.pricing}</span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Integrations;
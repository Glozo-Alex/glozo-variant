import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  MessageSquare,
  Target,
  Trophy,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings
} from "lucide-react";

const Team = () => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const teamMembers = [
    {
      id: "sarah",
      name: "Sarah Chen",
      role: "Senior Recruiter",
      status: "online",
      activePositions: 8,
      candidatesSourced: 124,
      hireRate: "67%",
      avgTimeToHire: "21 days",
      specialties: ["Frontend", "React", "TypeScript"],
      workload: 85
    },
    {
      id: "marcus",
      name: "Marcus Johnson",
      role: "Technical Recruiter",
      status: "online",
      activePositions: 6,
      candidatesSourced: 89,
      hireRate: "72%",
      avgTimeToHire: "18 days",
      specialties: ["Backend", "Python", "DevOps"],
      workload: 65
    },
    {
      id: "elena",
      name: "Elena Rodriguez",
      role: "Recruiting Coordinator",
      status: "away",
      activePositions: 4,
      candidatesSourced: 67,
      hireRate: "58%",
      avgTimeToHire: "25 days",
      specialties: ["Design", "Product", "UX/UI"],
      workload: 45
    },
    {
      id: "david",
      name: "David Kim",
      role: "Recruiting Manager",
      status: "offline",
      activePositions: 12,
      candidatesSourced: 156,
      hireRate: "61%",
      avgTimeToHire: "23 days",
      specialties: ["Leadership", "Strategy", "Scaling"],
      workload: 95
    }
  ];

  const assignments = [
    {
      position: "Senior React Developer",
      assignee: "Sarah Chen",
      status: "active",
      priority: "high",
      deadline: "Dec 15, 2024",
      candidates: 12,
      stage: "screening"
    },
    {
      position: "Data Scientist",
      assignee: "Marcus Johnson", 
      status: "active",
      priority: "medium",
      deadline: "Dec 20, 2024",
      candidates: 8,
      stage: "technical"
    },
    {
      position: "UX Designer",
      assignee: "Elena Rodriguez",
      status: "on-hold",
      priority: "low",
      deadline: "Jan 10, 2025",
      candidates: 6,
      stage: "sourcing"
    },
    {
      position: "DevOps Engineer",
      assignee: "Marcus Johnson",
      status: "active",
      priority: "high",
      deadline: "Dec 18, 2024",
      candidates: 15,
      stage: "final"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "offline": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 80) return "text-red-500";
    if (workload >= 60) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Collaboration</h1>
          <p className="text-muted-foreground">Manage team assignments and track performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Meeting
          </Button>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="card-interactive">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{member.name}</h3>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Active Positions</span>
                      <p className="font-semibold">{member.activePositions}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hire Rate</span>
                      <p className="font-semibold text-match-excellent">{member.hireRate}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {member.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Target className="h-3 w-3 mr-1" />
                      Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Active Members</span>
                </div>
                <p className="text-2xl font-bold mt-1">4</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Total Positions</span>
                </div>
                <p className="text-2xl font-bold mt-1">30</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Team Hire Rate</span>
                </div>
                <p className="text-2xl font-bold mt-1">64%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Avg. Time to Hire</span>
                </div>
                <p className="text-2xl font-bold mt-1">22d</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Position Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {assignment.status === "active" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="font-medium">{assignment.position}</span>
                      </div>
                      <Badge className={getPriorityColor(assignment.priority)}>
                        {assignment.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{assignment.assignee}</span>
                      <span>{assignment.candidates} candidates</span>
                      <span>Due: {assignment.deadline}</span>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Individual Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-sm">{member.name}</span>
                          <p className="text-xs text-muted-foreground">{member.candidatesSourced} candidates sourced</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-match-excellent">{member.hireRate}</p>
                        <p className="text-xs text-muted-foreground">{member.avgTimeToHire}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Team Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Performance charts and metrics would be rendered here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <span className={`font-semibold ${getWorkloadColor(member.workload)}`}>
                        {member.workload}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          member.workload >= 80 ? 'bg-red-500' :
                          member.workload >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${member.workload}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Team;
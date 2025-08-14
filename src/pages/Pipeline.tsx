import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Kanban, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  User,
  Calendar,
  MessageSquare,
  FileText,
  Move
} from "lucide-react";

const Pipeline = () => {
  const [selectedPosition, setSelectedPosition] = useState("senior-react");

  const positions = [
    { id: "senior-react", name: "Senior React Developer", company: "TechCorp", status: "active" },
    { id: "data-scientist", name: "Data Scientist", company: "AI Startup", status: "active" },
    { id: "product-manager", name: "Product Manager", company: "FinTech Ltd", status: "on-hold" }
  ];

  const stages = [
    { 
      id: "sourced", 
      name: "Sourced", 
      count: 24, 
      color: "bg-gray-100 text-gray-800",
      candidates: [
        { id: 1, name: "Sarah Chen", title: "Frontend Developer", stage: "sourced", rating: 4.5, lastActivity: "2 hours ago" },
        { id: 2, name: "Marcus Johnson", title: "React Developer", stage: "sourced", rating: 4.2, lastActivity: "1 day ago" },
        { id: 3, name: "Elena Rodriguez", title: "Full Stack Developer", stage: "sourced", rating: 4.7, lastActivity: "3 hours ago" }
      ]
    },
    { 
      id: "screening", 
      name: "Initial Screening", 
      count: 12, 
      color: "bg-blue-100 text-blue-800",
      candidates: [
        { id: 4, name: "David Kim", title: "Senior Frontend Developer", stage: "screening", rating: 4.6, lastActivity: "5 hours ago" },
        { id: 5, name: "Lisa Wang", title: "React Native Developer", stage: "screening", rating: 4.3, lastActivity: "1 day ago" }
      ]
    },
    { 
      id: "technical", 
      name: "Technical Interview", 
      count: 8, 
      color: "bg-yellow-100 text-yellow-800",
      candidates: [
        { id: 6, name: "Alex Thompson", title: "Full Stack Engineer", stage: "technical", rating: 4.8, lastActivity: "30 mins ago" },
        { id: 7, name: "Maria Garcia", title: "Frontend Specialist", stage: "technical", rating: 4.4, lastActivity: "2 hours ago" }
      ]
    },
    { 
      id: "final", 
      name: "Final Interview", 
      count: 4, 
      color: "bg-purple-100 text-purple-800",
      candidates: [
        { id: 8, name: "James Wilson", title: "Senior React Developer", stage: "final", rating: 4.9, lastActivity: "1 hour ago" }
      ]
    },
    { 
      id: "offer", 
      name: "Offer Stage", 
      count: 2, 
      color: "bg-green-100 text-green-800",
      candidates: [
        { id: 9, name: "Anna Kowalski", title: "Lead Frontend Developer", stage: "offer", rating: 4.7, lastActivity: "4 hours ago" }
      ]
    },
    { 
      id: "hired", 
      name: "Hired", 
      count: 1, 
      color: "bg-emerald-100 text-emerald-800",
      candidates: []
    }
  ];

  const CandidateCard = ({ candidate }: { candidate: any }) => (
    <Card className="mb-3 hover-lift cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">{candidate.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{candidate.name}</h4>
              <p className="text-xs text-muted-foreground">{candidate.title}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span>{candidate.rating}</span>
          </div>
          <span className="text-muted-foreground">{candidate.lastActivity}</span>
        </div>
        
        <div className="flex items-center gap-1 mt-2">
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <MessageSquare className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <Calendar className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <FileText className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hiring Pipeline</h1>
          <p className="text-muted-foreground">Manage candidates through your hiring process</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Move className="h-4 w-4" />
            Bulk Actions
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Position Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Position:</span>
        {positions.map((position) => (
          <Button
            key={position.id}
            variant={selectedPosition === position.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPosition(position.id)}
            className="flex items-center gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${position.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {position.name}
          </Button>
        ))}
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="w-80 flex-shrink-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Kanban className="h-4 w-4" />
                      {stage.name}
                    </CardTitle>
                    <Badge className={stage.color} variant="outline">
                      {stage.count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {stage.candidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                  
                  {/* Add Candidate Button */}
                  <Button
                    variant="ghost"
                    className="w-full h-12 border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Candidates</span>
            </div>
            <p className="text-2xl font-bold mt-1">51</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Avg. Stage Time</span>
            </div>
            <p className="text-2xl font-bold mt-1">3.2d</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Interviews Scheduled</span>
            </div>
            <p className="text-2xl font-bold mt-1">8</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Offers Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1">2</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pipeline;
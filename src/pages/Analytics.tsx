import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Calendar,
  Download,
  Filter
} from "lucide-react";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("week");

  const metrics = [
    {
      title: "Active Positions",
      value: "23",
      change: "+12%",
      trend: "up",
      icon: Target,
      color: "text-match-excellent"
    },
    {
      title: "Candidates Sourced",
      value: "187",
      change: "+24%",
      trend: "up", 
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Avg. Time to Hire",
      value: "18 days",
      change: "-3 days",
      trend: "up",
      icon: Clock,
      color: "text-match-good"
    },
    {
      title: "Conversion Rate",
      value: "12.3%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-match-excellent"
    }
  ];

  const pipelineData = [
    { stage: "Sourced", count: 187, percentage: 100 },
    { stage: "Screening", count: 94, percentage: 50 },
    { stage: "1st Interview", count: 47, percentage: 25 },
    { stage: "2nd Interview", count: 23, percentage: 12 },
    { stage: "Final", count: 12, percentage: 6 },
    { stage: "Offer", count: 8, percentage: 4 },
    { stage: "Hired", count: 6, percentage: 3 }
  ];

  const topPerformers = [
    { name: "Sarah Chen", positions: 8, hires: 6, rate: "75%" },
    { name: "Marcus Johnson", positions: 12, hires: 8, rate: "67%" },
    { name: "Elena Rodriguez", positions: 6, hires: 4, rate: "67%" },
    { name: "David Kim", positions: 9, hires: 5, rate: "56%" }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your recruiting performance and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        {["day", "week", "month", "quarter"].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
            className="capitalize"
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className={metric.trend === "up" ? "text-match-excellent" : "text-match-poor"}>
                  {metric.change}
                </span>
                <span className="text-muted-foreground">from last {timeRange}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Funnel */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Hiring Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pipelineData.map((stage) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">{stage.count} candidates</span>
                    </div>
                    <Progress value={stage.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div key={performer.name} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{performer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {performer.hires}/{performer.positions} positions filled
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-match-excellent text-white">
                      {performer.rate}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Recruiting Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Interactive performance charts would be rendered here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Candidate Sources Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Source effectiveness charts would be rendered here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>AI-Powered Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Predictive analytics and forecasting models would be rendered here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
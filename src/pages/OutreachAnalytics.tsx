import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Send, 
  Eye, 
  MousePointer, 
  MessageSquare,
  TrendingUp,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const OutreachAnalytics = () => {
  const [timeRange, setTimeRange] = useState("week");
  const { user } = useAuth();

  // Fetch email analytics data
  const { data: emailMetrics } = useQuery({
    queryKey: ['email-metrics', user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: logs } = await supabase
        .from('email_logs')
        .select('*')
        .eq('user_id', user.id);

      const totalSent = logs?.filter(log => log.status === 'sent').length || 0;
      const totalOpened = logs?.filter(log => log.opened_at).length || 0;
      const totalClicked = logs?.filter(log => log.clicked_at).length || 0;
      const totalFailed = logs?.filter(log => log.status === 'failed').length || 0;

      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      const deliveryRate = logs ? ((logs.length - totalFailed) / logs.length) * 100 : 0;

      return {
        totalSent,
        totalOpened,
        totalClicked,
        totalFailed,
        openRate,
        clickRate,
        deliveryRate
      };
    },
    enabled: !!user?.id
  });

  // Fetch sequence performance data
  const { data: sequencePerformance } = useQuery({
    queryKey: ['sequence-performance', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: sequences } = await supabase
        .from('email_sequences')
        .select(`
          id,
          name,
          email_logs!inner(status, opened_at, clicked_at)
        `)
        .eq('user_id', user.id);

      return sequences?.map(seq => {
        const logs = seq.email_logs;
        const sent = logs.filter((log: any) => log.status === 'sent').length;
        const opened = logs.filter((log: any) => log.opened_at).length;
        const clicked = logs.filter((log: any) => log.clicked_at).length;

        return {
          name: seq.name,
          sent,
          openRate: sent > 0 ? (opened / sent) * 100 : 0,
          clickRate: sent > 0 ? (clicked / sent) * 100 : 0
        };
      }) || [];
    },
    enabled: !!user?.id
  });

  const metrics = [
    {
      title: "Emails Sent",
      value: emailMetrics?.totalSent?.toString() || "0",
      change: "+24%",
      trend: "up",
      icon: Send,
      color: "text-primary"
    },
    {
      title: "Delivery Rate",
      value: `${emailMetrics?.deliveryRate?.toFixed(1) || "0"}%`,
      change: "+2.1%",
      trend: "up",
      icon: Mail,
      color: "text-match-excellent"
    },
    {
      title: "Open Rate",
      value: `${emailMetrics?.openRate?.toFixed(1) || "0"}%`,
      change: "+1.3%",
      trend: "up", 
      icon: Eye,
      color: "text-match-good"
    },
    {
      title: "Click Rate",
      value: `${emailMetrics?.clickRate?.toFixed(1) || "0"}%`,
      change: "+0.8%",
      trend: "up",
      icon: MousePointer,
      color: "text-match-excellent"
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outreach Analytics</h1>
          <p className="text-muted-foreground">Track your email sequence performance and engagement</p>
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Funnel */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Engagement Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">Sent</span>
                    <span className="text-muted-foreground">{emailMetrics?.totalSent || 0} emails</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">Opened</span>
                    <span className="text-muted-foreground">{emailMetrics?.totalOpened || 0} emails</span>
                  </div>
                  <Progress value={emailMetrics?.openRate || 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">Clicked</span>
                    <span className="text-muted-foreground">{emailMetrics?.totalClicked || 0} emails</span>
                  </div>
                  <Progress value={emailMetrics?.clickRate || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Email performance charts over time would be rendered here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Sequence Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sequencePerformance?.length ? (
                sequencePerformance.map((seq, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{seq.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {seq.sent} emails sent
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-match-good text-white">
                        {seq.openRate.toFixed(1)}% open
                      </Badge>
                      <Badge variant="secondary" className="bg-match-excellent text-white">
                        {seq.clickRate.toFixed(1)}% click
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No sequence data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Template performance analysis would be rendered here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Recipient Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Recipient engagement analysis would be rendered here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OutreachAnalytics;
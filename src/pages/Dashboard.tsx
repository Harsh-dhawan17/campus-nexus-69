import { 
  Users, 
  Calendar, 
  BookOpen, 
  Building, 
  MessageSquare, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  QrCode,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    return `${greeting}, ${user.name.split(' ')[0]}!`;
  };

  const studentStats = [
    { title: "Attendance", value: "92%", icon: QrCode, color: "text-accent", trend: "+2%" },
    { title: "Library Books", value: "3", icon: BookOpen, color: "text-primary", trend: "+1" },
    { title: "Events Joined", value: "8", icon: Calendar, color: "text-warning", trend: "+2" },
    { title: "Pending Fees", value: "₹2,500", icon: CreditCard, color: "text-destructive", trend: "-₹500" },
  ];

  const teacherStats = [
    { title: "Classes Today", value: "4", icon: Clock, color: "text-primary", trend: "+1" },
    { title: "Students", value: "156", icon: Users, color: "text-accent", trend: "+12" },
    { title: "Attendance Avg", value: "87%", icon: BarChart3, color: "text-warning", trend: "+5%" },
    { title: "Pending Tasks", value: "7", icon: AlertCircle, color: "text-destructive", trend: "-3" },
  ];

  const adminStats = [
    { title: "Total Users", value: "2,847", icon: Users, color: "text-primary", trend: "+143" },
    { title: "Active Events", value: "12", icon: Calendar, color: "text-accent", trend: "+3" },
    { title: "Library Books", value: "15,420", icon: BookOpen, color: "text-warning", trend: "+50" },
    { title: "Complaints", value: "23", icon: MessageSquare, color: "text-destructive", trend: "-8" },
  ];

  const getStats = () => {
    switch (user.role) {
      case "admin":
        return adminStats;
      case "teacher":
        return teacherStats;
      default:
        return studentStats;
    }
  };

  const stats = getStats();

  const recentActivities = [
    { action: "Marked attendance for Computer Science", time: "2 hours ago", type: "success" },
    { action: "Borrowed 'Data Structures' from library", time: "1 day ago", type: "info" },
    { action: "Registered for Tech Symposium 2024", time: "2 days ago", type: "warning" },
    { action: "Submitted complaint about hostel WiFi", time: "3 days ago", type: "error" },
  ];

  const upcomingEvents = [
    { title: "Tech Symposium 2024", date: "Jan 25, 2024", time: "10:00 AM", location: "Main Auditorium" },
    { title: "Library Workshop", date: "Jan 28, 2024", time: "2:00 PM", location: "Library Hall" },
    { title: "Sports Day", date: "Feb 2, 2024", time: "9:00 AM", location: "Sports Complex" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-hero rounded-xl p-6 text-primary-foreground shadow-strong">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getWelcomeMessage()}</h1>
            <p className="text-primary-foreground/80 text-lg">
              Welcome back to your Smart Campus dashboard
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary-foreground/20">
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-lg font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <Badge variant="secondary" className="mb-2">
                {user.role.toUpperCase()}
              </Badge>
              <p className="text-sm text-primary-foreground/70">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-all duration-300 bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="text-accent font-medium">{stat.trend}</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest campus activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-accent' :
                  activity.type === 'info' ? 'bg-primary' :
                  activity.type === 'warning' ? 'bg-warning' : 'bg-destructive'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Events you might be interested in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                  <Badge variant="outline">{event.date}</Badge>
                </div>
                <p className="text-sm text-primary font-medium mt-2">{event.time}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              View All Events
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {user.role === "student" && (
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col gap-2 bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <QrCode className="h-6 w-6" />
                Mark Attendance
              </Button>
              <Button variant="secondary" className="h-20 flex-col gap-2">
                <BookOpen className="h-6 w-6" />
                Browse Library
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Building className="h-6 w-6" />
                Hostel Services
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <MessageSquare className="h-6 w-6" />
                File Complaint
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Progress (Student Only) */}
      {user.role === "student" && (
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Attendance Progress
            </CardTitle>
            <CardDescription>Your attendance across all subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { subject: "Computer Science", percentage: 95, classes: "38/40" },
              { subject: "Mathematics", percentage: 88, classes: "35/40" },
              { subject: "Physics", percentage: 92, classes: "37/40" },
              { subject: "English", percentage: 85, classes: "34/40" },
            ].map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{subject.subject}</span>
                  <span className="text-sm text-muted-foreground">
                    {subject.percentage}% ({subject.classes})
                  </span>
                </div>
                <Progress value={subject.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
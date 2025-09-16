import { QrCode, Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface AttendanceProps {
  user: User;
}

export default function Attendance({ user }: AttendanceProps) {
  const attendanceRecords = [
    { date: "2024-01-15", subject: "Computer Science", status: "present", time: "09:00 AM" },
    { date: "2024-01-15", subject: "Mathematics", status: "present", time: "11:00 AM" },
    { date: "2024-01-15", subject: "Physics", status: "absent", time: "02:00 PM" },
    { date: "2024-01-14", subject: "Computer Science", status: "present", time: "09:00 AM" },
    { date: "2024-01-14", subject: "English", status: "present", time: "03:00 PM" },
  ];

  const subjectStats = [
    { subject: "Computer Science", present: 38, total: 40, percentage: 95 },
    { subject: "Mathematics", present: 35, total: 40, percentage: 87.5 },
    { subject: "Physics", present: 37, total: 40, percentage: 92.5 },
    { subject: "English", present: 34, total: 40, percentage: 85 },
  ];

  const todaysClasses = [
    { subject: "Data Structures", time: "09:00 AM", room: "CS-101", status: "upcoming" },
    { subject: "Algorithm Analysis", time: "11:00 AM", room: "CS-102", status: "marked" },
    { subject: "Database Systems", time: "02:00 PM", room: "CS-103", status: "upcoming" },
    { subject: "Software Engineering", time: "04:00 PM", room: "CS-104", status: "upcoming" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track your class attendance and participation</p>
        </div>
        {user.role === "student" && (
          <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
            <QrCode className="mr-2 h-4 w-4" />
            Scan QR Code
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Attended</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">144/160</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consecutive Days</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Perfect attendance streak</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk Subjects</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Below 75% threshold</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={user.role === "student" ? "today" : "overview"} className="space-y-4">
        <TabsList>
          <TabsTrigger value={user.role === "student" ? "today" : "overview"}>
            {user.role === "student" ? "Today's Classes" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="subjects">Subject Wise</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card className="shadow-soft bg-gradient-card">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Mark attendance for your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysClasses.map((class_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                    <div className="space-y-1">
                      <h4 className="font-medium">{class_.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        {class_.time} • {class_.room}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={class_.status === "marked" ? "default" : "secondary"}
                        className={class_.status === "marked" ? "bg-accent" : ""}
                      >
                        {class_.status === "marked" ? "Present" : "Pending"}
                      </Badge>
                      {class_.status === "upcoming" && (
                        <Button size="sm" className="bg-gradient-primary">
                          <QrCode className="mr-2 h-3 w-3" />
                          Mark Present
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <Card className="shadow-soft bg-gradient-card">
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Class attendance statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold">87.5%</div>
                  <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <Calendar className="h-8 w-8 text-warning mx-auto mb-2" />
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-sm text-muted-foreground">Classes Today</p>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-sm text-muted-foreground">Absent Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card className="shadow-soft bg-gradient-card">
            <CardHeader>
              <CardTitle>Subject-wise Attendance</CardTitle>
              <CardDescription>Track your attendance across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subjectStats.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{subject.subject}</h4>
                      <div className="text-sm text-muted-foreground">
                        {subject.present}/{subject.total} classes • {subject.percentage}%
                      </div>
                    </div>
                    <Progress value={subject.percentage} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Minimum required: 75%</span>
                      <span className={subject.percentage >= 75 ? "text-accent" : "text-destructive"}>
                        {subject.percentage >= 75 ? "Good standing" : "At risk"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="shadow-soft bg-gradient-card">
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceRecords.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        record.status === "present" ? "bg-accent" : "bg-destructive"
                      }`} />
                      <div>
                        <p className="font-medium">{record.subject}</p>
                        <p className="text-sm text-muted-foreground">{record.date} • {record.time}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={record.status === "present" ? "default" : "destructive"}
                      className={record.status === "present" ? "bg-accent" : ""}
                    >
                      {record.status === "present" ? "Present" : "Absent"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
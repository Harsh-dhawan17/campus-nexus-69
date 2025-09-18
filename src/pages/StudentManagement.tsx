import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Plus, Users, BookOpen, AlertCircle, Calendar, Edit2, Trash2 } from "lucide-react";

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  student_id: string;
  department?: string;
  year?: number;
  phone?: string;
  hostel_id?: string;
  room_number?: string;
  avatar_url?: string;
}

interface StudentUpdate {
  id: string;
  student_id: string;
  staff_id: string;
  update_type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  student?: {
    full_name: string;
    student_id: string;
  } | null;
  staff?: {
    full_name: string;
  } | null;
}

interface StudentManagementProps {
  user: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    role: string;
  } | null;
}

export default function StudentManagement({ user }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentUpdates, setStudentUpdates] = useState<StudentUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: "",
    description: "",
    update_type: "general",
    priority: "medium"
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === 'student') {
      // Redirect students away from this page
      window.location.href = '/dashboard';
      return;
    }
    fetchStudents();
    fetchStudentUpdates();
  }, [user]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');

      if (error) throw error;
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('student_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch student and staff details separately
      const updatesWithDetails = await Promise.all(
        data.map(async (update) => {
          const [studentData, staffData] = await Promise.all([
            supabase.from('profiles').select('full_name, student_id').eq('id', update.student_id).single(),
            supabase.from('profiles').select('full_name').eq('id', update.staff_id).single()
          ]);

          return {
            ...update,
            student: studentData.data,
            staff: staffData.data
          };
        })
      );

      setStudentUpdates(updatesWithDetails);
    } catch (error) {
      console.error('Error fetching student updates:', error);
    }
  };

  const createStudentUpdate = async () => {
    if (!selectedStudent || !user) return;

    try {
      const { error } = await supabase
        .from('student_updates')
        .insert({
          student_id: selectedStudent.id,
          staff_id: user.id,
          title: newUpdate.title,
          description: newUpdate.description,
          update_type: newUpdate.update_type,
          priority: newUpdate.priority
        });

      if (error) throw error;

      // Create notification for student
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedStudent.id,
          title: `New ${newUpdate.update_type} update`,
          message: newUpdate.title,
          type: newUpdate.priority === 'urgent' ? 'warning' : 'info',
          category: 'general',
          metadata: {
            update_type: newUpdate.update_type,
            staff_name: user.full_name
          }
        });

      toast({
        title: "Success",
        description: "Student update created successfully",
      });

      setUpdateDialogOpen(false);
      setNewUpdate({ title: "", description: "", update_type: "general", priority: "medium" });
      fetchStudentUpdates();
    } catch (error) {
      console.error('Error creating student update:', error);
      toast({
        title: "Error",
        description: "Failed to create student update",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'disciplinary': return <AlertCircle className="h-4 w-4" />;
      case 'attendance': return <Calendar className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user?.role === 'student') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">This page is only accessible to staff and administrators.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Manage students and their daily updates</p>
        </div>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="updates">Recent Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{student.full_name}</CardTitle>
                    <Badge variant="outline">{student.student_id}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {student.email}</p>
                    {student.department && <p><strong>Department:</strong> {student.department}</p>}
                    {student.year && <p><strong>Year:</strong> {student.year}</p>}
                    {student.phone && <p><strong>Phone:</strong> {student.phone}</p>}
                    {student.hostel_id && (
                      <p><strong>Hostel:</strong> Room {student.room_number}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Update
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <div className="space-y-4">
            {studentUpdates.map((update) => (
              <Card key={update.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getUpdateTypeIcon(update.update_type)}
                      <CardTitle className="text-lg">{update.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(update.priority)}>
                        {update.priority}
                      </Badge>
                      <Badge variant="outline">{update.update_type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{update.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>
                      <strong>Student:</strong> {update.student?.full_name} ({update.student?.student_id})
                    </p>
                    <p>
                      <strong>By:</strong> {update.staff?.full_name}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(update.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Student Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStudent && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedStudent.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedStudent.student_id}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                placeholder="Enter update title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newUpdate.description}
                onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                placeholder="Enter update description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="update_type">Type</Label>
                <Select value={newUpdate.update_type} onValueChange={(value) => setNewUpdate({ ...newUpdate, update_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="disciplinary">Disciplinary</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newUpdate.priority} onValueChange={(value) => setNewUpdate({ ...newUpdate, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createStudentUpdate} disabled={!newUpdate.title || !newUpdate.description}>
                Create Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
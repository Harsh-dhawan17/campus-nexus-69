import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, QrCode, Plus, Clock, Users, CheckCircle, XCircle } from "lucide-react";

interface QRCode {
  id: string;
  code: string;
  class_subject: string;
  class_type: string;
  time_slot: string;
  location?: string;
  date: string;
  expires_at: string;
  is_active: boolean;
  teacher_id: string;
}

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: string;
  class_subject: string;
  class_type: string;
  time_slot: string;
  marked_at: string;
  student?: {
    full_name: string;
    student_id: string;
  };
}

interface AttendanceMarkingProps {
  user: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    role: string;
  } | null;
}

export default function AttendanceMarking({ user }: AttendanceMarkingProps) {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createQRDialogOpen, setCreateQRDialogOpen] = useState(false);
  const [markAttendanceDialogOpen, setMarkAttendanceDialogOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null);
  const [newQRCode, setNewQRCode] = useState({
    class_subject: "",
    class_type: "lecture",
    time_slot: "",
    location: "",
    duration: "60" // minutes
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'staff') {
      return;
    }
    fetchQRCodes();
    fetchTodaysAttendance();
  }, [user]);

  const fetchQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_qr_codes')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQRCodes(data);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch QR codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .order('marked_at', { ascending: false });

      if (error) throw error;

      // Fetch student details
      const recordsWithStudents = await Promise.all(
        data.map(async (record) => {
          const { data: studentData } = await supabase
            .from('profiles')
            .select('full_name, student_id')
            .eq('id', record.user_id)
            .single();

          return {
            ...record,
            student: studentData
          };
        })
      );

      setAttendanceRecords(recordsWithStudents);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const generateQRCode = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + parseInt(newQRCode.duration) * 60000);
      const code = Math.random().toString(36).substring(2, 15);

      const { error } = await supabase
        .from('attendance_qr_codes')
        .insert({
          teacher_id: user.id,
          code,
          class_subject: newQRCode.class_subject,
          class_type: newQRCode.class_type,
          time_slot: newQRCode.time_slot,
          location: newQRCode.location,
          date: now.toISOString().split('T')[0],
          expires_at: expiresAt.toISOString(),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "QR code generated successfully",
      });

      setCreateQRDialogOpen(false);
      setNewQRCode({
        class_subject: "",
        class_type: "lecture",
        time_slot: "",
        location: "",
        duration: "60"
      });
      fetchQRCodes();
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const markAttendanceManually = async (studentId: string, status: 'present' | 'absent') => {
    if (!selectedQRCode || !user) return;

    try {
      const { error } = await supabase
        .from('attendance')
        .insert({
          user_id: studentId,
          date: selectedQRCode.date,
          status,
          class_subject: selectedQRCode.class_subject,
          class_type: selectedQRCode.class_type,
          time_slot: selectedQRCode.time_slot,
          marked_by: user.id,
          location: selectedQRCode.location,
          qr_code_id: selectedQRCode.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Attendance marked as ${status}`,
      });

      fetchTodaysAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const deactivateQRCode = async (qrCodeId: string) => {
    try {
      const { error } = await supabase
        .from('attendance_qr_codes')
        .update({ is_active: false })
        .eq('id', qrCodeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "QR code deactivated",
      });

      fetchQRCodes();
    } catch (error) {
      console.error('Error deactivating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate QR code",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">This page is only accessible to staff and administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Generate QR codes and mark attendance</p>
        </div>
        <Dialog open={createQRDialogOpen} onOpenChange={setCreateQRDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Tabs defaultValue="qr-codes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="qr-codes">Active QR Codes</TabsTrigger>
          <TabsTrigger value="attendance">Today's Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="qr-codes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {qrCodes.map((qrCode) => (
              <Card key={qrCode.id} className={`${qrCode.is_active ? 'border-green-200' : 'border-gray-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{qrCode.class_subject}</CardTitle>
                    <Badge variant={qrCode.is_active ? "default" : "secondary"}>
                      {qrCode.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <p><strong>Type:</strong> {qrCode.class_type}</p>
                    <p><strong>Time:</strong> {qrCode.time_slot}</p>
                    {qrCode.location && <p><strong>Location:</strong> {qrCode.location}</p>}
                    <p><strong>Code:</strong> <code className="bg-muted px-2 py-1 rounded">{qrCode.code}</code></p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(qrCode.expires_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {qrCode.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deactivateQRCode(qrCode.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {qrCodes.length === 0 && (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No QR codes found</h3>
              <p className="text-muted-foreground">Generate a QR code to start marking attendance</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="space-y-4">
            {attendanceRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {record.status === 'present' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{record.student?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{record.student?.student_id}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                        {record.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>{record.class_subject} - {record.time_slot}</p>
                        <p>{new Date(record.marked_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {attendanceRecords.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No attendance records</h3>
              <p className="text-muted-foreground">No attendance has been marked today</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Generate QR Code Dialog */}
      <Dialog open={createQRDialogOpen} onOpenChange={setCreateQRDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class_subject">Subject</Label>
              <Input
                id="class_subject"
                value={newQRCode.class_subject}
                onChange={(e) => setNewQRCode({ ...newQRCode, class_subject: e.target.value })}
                placeholder="Enter subject name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_type">Class Type</Label>
              <Select value={newQRCode.class_type} onValueChange={(value) => setNewQRCode({ ...newQRCode, class_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="practical">Practical</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_slot">Time Slot</Label>
              <Select value={newQRCode.time_slot} onValueChange={(value) => setNewQRCode({ ...newQRCode, time_slot: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00-10:00">09:00 - 10:00</SelectItem>
                  <SelectItem value="10:00-11:00">10:00 - 11:00</SelectItem>
                  <SelectItem value="11:00-12:00">11:00 - 12:00</SelectItem>
                  <SelectItem value="12:00-13:00">12:00 - 13:00</SelectItem>
                  <SelectItem value="14:00-15:00">14:00 - 15:00</SelectItem>
                  <SelectItem value="15:00-16:00">15:00 - 16:00</SelectItem>
                  <SelectItem value="16:00-17:00">16:00 - 17:00</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={newQRCode.location}
                onChange={(e) => setNewQRCode({ ...newQRCode, location: e.target.value })}
                placeholder="Enter classroom/location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={newQRCode.duration} onValueChange={(value) => setNewQRCode({ ...newQRCode, duration: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateQRDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={generateQRCode} disabled={!newQRCode.class_subject || !newQRCode.time_slot}>
                Generate QR Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
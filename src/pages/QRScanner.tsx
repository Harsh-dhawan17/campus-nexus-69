import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Scan, Clock, MapPin, Calendar, CheckCircle, XCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface QRScannerProps {
  user: User | null;
}

interface QRCode {
  id: string;
  code: string;
  date: string;
  time_slot: string;
  class_subject: string;
  class_type: string;
  location?: string;
  expires_at: string;
  is_active: boolean;
  teacher_id: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  time_slot: string;
  class_subject: string;
  class_type: string;
  status: string;
  marked_at: string;
  location?: string;
}

export default function QRScanner({ user }: QRScannerProps) {
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [availableQRCodes, setAvailableQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayAttendance();
    fetchAvailableQRCodes();
  }, [user]);

  const fetchTodayAttendance = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .order("marked_at", { ascending: false });

      if (error) throw error;
      setTodayAttendance(data || []);
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableQRCodes = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("attendance_qr_codes")
        .select("*")
        .eq("date", today)
        .eq("is_active", true)
        .gt("expires_at", now)
        .order("time_slot");

      if (error) throw error;
      setAvailableQRCodes(data || []);
    } catch (error: any) {
      console.error("Error fetching QR codes:", error);
    }
  };

  const handleManualCodeSubmit = async () => {
    if (!manualCode.trim() || !user) return;

    setIsScanning(true);
    try {
      // First, verify the QR code exists and is valid
      const { data: qrCode, error: qrError } = await supabase
        .from("attendance_qr_codes")
        .select("*")
        .eq("code", manualCode.trim())
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (qrError || !qrCode) {
        toast({
          title: "Invalid Code",
          description: "The QR code is invalid, expired, or not found.",
          variant: "destructive"
        });
        return;
      }

      // Check if already marked for this class
      const { data: existingAttendance } = await supabase
        .from("attendance")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", qrCode.date)
        .eq("time_slot", qrCode.time_slot)
        .eq("class_subject", qrCode.class_subject)
        .single();

      if (existingAttendance) {
        toast({
          title: "Already Marked",
          description: "Your attendance for this class has already been recorded.",
          variant: "destructive"
        });
        return;
      }

      // Mark attendance
      const { error: attendanceError } = await supabase
        .from("attendance")
        .insert([{
          user_id: user.id,
          date: qrCode.date,
          time_slot: qrCode.time_slot,
          class_subject: qrCode.class_subject,
          class_type: qrCode.class_type,
          location: qrCode.location,
          status: "present",
          qr_code_id: qrCode.code,
          marked_by: qrCode.teacher_id
        }]);

      if (attendanceError) throw attendanceError;

      toast({
        title: "Attendance Marked!",
        description: `Successfully marked present for ${qrCode.class_subject} - ${qrCode.time_slot}`,
      });

      setManualCode("");
      fetchTodayAttendance();
      fetchAvailableQRCodes();

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "default";
      case "absent": return "destructive";
      case "late": return "secondary";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="h-4 w-4" />;
      case "absent": return <XCircle className="h-4 w-4" />;
      case "late": return <Clock className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const isQRCodeExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s remaining`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Attendance</h1>
          <p className="text-muted-foreground">
            Scan QR codes to mark your attendance
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code Scanner */}
        <Card className="hover:shadow-medium transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scan className="mr-2 h-5 w-5 text-primary" />
              Attendance Scanner
            </CardTitle>
            <CardDescription>
              Enter the QR code from your teacher's screen to mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-code">QR Code</Label>
              <Input
                id="qr-code"
                placeholder="Enter QR code here..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleManualCodeSubmit()}
              />
            </div>
            
            <Button 
              onClick={handleManualCodeSubmit}
              disabled={!manualCode.trim() || isScanning}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Marking Attendance...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Mark Attendance
                </>
              )}
            </Button>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">How to use:</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Ask your teacher to display the QR code</li>
                <li>2. Type the code shown in the QR image above</li>
                <li>3. Click "Mark Attendance" to confirm</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Today's Attendance
            </CardTitle>
            <CardDescription>
              Your attendance records for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAttendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{record.class_subject}</span>
                      <Badge variant="outline">{record.class_type}</Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{record.time_slot}</span>
                      {record.location && (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span>{record.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(record.status)}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1">{record.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
              
              {todayAttendance.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No attendance marked yet today
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available QR Codes for Today */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="mr-2 h-5 w-5 text-primary" />
            Active Classes Today
          </CardTitle>
          <CardDescription>
            Classes with active QR codes for attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableQRCodes.map((qrCode) => (
              <div key={qrCode.id} className="p-4 border rounded-lg hover:shadow-soft transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{qrCode.class_subject}</h4>
                    <Badge variant="outline">{qrCode.class_type}</Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-3 w-3" />
                      {qrCode.time_slot}
                    </div>
                    {qrCode.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-3 w-3" />
                        {qrCode.location}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs">
                    {isQRCodeExpired(qrCode.expires_at) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge variant="secondary">
                        {getTimeRemaining(qrCode.expires_at)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {availableQRCodes.length === 0 && (
            <div className="text-center py-12">
              <QrCode className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No active classes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no classes with active QR codes right now.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
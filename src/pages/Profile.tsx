import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, GraduationCap, Building, Calendar, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  student_id?: string;
  role: string;
  department?: string;
  year?: number;
  phone?: string;
  avatar_url?: string;
  hostel_id?: string;
  room_number?: string;
  created_at: string;
  updated_at: string;
}

interface ProfileProps {
  user: User | null;
}

interface Hostel {
  id: string;
  name: string;
  type: string;
}

export default function Profile({ user }: ProfileProps) {
  const [profile, setProfile] = useState<User | null>(user);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    student_id: user?.student_id || "",
    phone: user?.phone || "",
    department: user?.department || "",
    year: user?.year?.toString() || "",
    hostel_id: user?.hostel_id || "",
    room_number: user?.room_number || ""
  });

  useEffect(() => {
    fetchProfile();
    fetchHostels();
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        student_id: user.student_id || "",
        phone: user.phone || "",
        department: user.department || "",
        year: user.year?.toString() || "",
        hostel_id: user.hostel_id || "",
        room_number: user.room_number || ""
      });
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.user_id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchHostels = async () => {
    try {
      const { data, error } = await supabase
        .from("hostels")
        .select("id, name, type")
        .order("name");

      if (error) throw error;
      setHostels(data || []);
    } catch (error: any) {
      console.error("Error fetching hostels:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        department: formData.department || null,
        year: formData.year ? parseInt(formData.year) : null,
        hostel_id: formData.hostel_id || null,
        room_number: formData.room_number || null,
        student_id: formData.student_id || null
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.user_id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });

      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        student_id: profile.student_id || "",
        phone: profile.phone || "",
        department: profile.department || "",
        year: profile.year?.toString() || "",
        hostel_id: profile.hostel_id || "",
        room_number: profile.room_number || ""
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "teacher": return "default";
      case "warden": return "secondary";
      case "student": return "outline";
      default: return "outline";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!profile) {
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
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and personal information
          </p>
        </div>
        
        {isEditing ? (
          <div className="space-x-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{profile.full_name}</CardTitle>
            <CardDescription className="flex items-center justify-center">
              <Badge variant={getRoleColor(profile.role)} className="capitalize">
                {profile.role}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              
              {profile.student_id && (
                <div className="flex items-center space-x-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.student_id}</span>
                </div>
              )}
              
              {profile.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              
              {profile.room_number && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Room {profile.room_number}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) => handleInputChange("student_id", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Computer Science"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select 
                  value={formData.year} 
                  onValueChange={(value) => handleInputChange("year", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hostel">Hostel</Label>
                <Select 
                  value={formData.hostel_id} 
                  onValueChange={(value) => handleInputChange("hostel_id", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostels.map((hostel) => (
                      <SelectItem key={hostel.id} value={hostel.id}>
                        {hostel.name} ({hostel.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => handleInputChange("room_number", e.target.value)}
                  disabled={!isEditing}
                  placeholder="A-101"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent account activity and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 bg-secondary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Account created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Last changed: Unknown
                  </p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus, Search, Clock, CheckCircle, XCircle, User } from "lucide-react";
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

interface ComplaintManagementProps {
  user: User | null;
}

interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  user_id: string;
  assigned_to?: string;
}

export default function ComplaintManagement({ user }: ComplaintManagementProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    subject: "",
    description: "",
    category: "academic",
    priority: "medium"
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "warden") {
      fetchAllComplaints();
    }
    fetchMyComplaints();
  }, [user]);

  const fetchAllComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch complaints",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyComplaints = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyComplaints(data || []);
    } catch (error: any) {
      console.error("Error fetching my complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async () => {
    if (!user) return;
    
    try {
      const complaintData = {
        subject: newComplaint.subject,
        description: newComplaint.description,
        category: newComplaint.category,
        priority: newComplaint.priority,
        user_id: user.id,
        status: "pending"
      };

      const { error } = await supabase
        .from("complaints")
        .insert([complaintData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Complaint submitted successfully!"
      });

      setIsCreateDialogOpen(false);
      setNewComplaint({
        subject: "",
        description: "",
        category: "academic",
        priority: "medium"
      });
      
      fetchMyComplaints();
      if (user?.role === "admin" || user?.role === "warden") {
        fetchAllComplaints();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit complaint",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "in_progress": return "default";
      case "resolved": return "outline";
      case "rejected": return "destructive";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "in_progress": return <AlertCircle className="h-4 w-4" />;
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "outline";
      case "medium": return "secondary";
      case "high": return "destructive";
      default: return "default";
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || complaint.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const filteredMyComplaints = myComplaints.filter(complaint => {
    return complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Complaint Management</h1>
          <p className="text-muted-foreground">
            Submit and track your campus complaints
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Submit Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit New Complaint</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll work to resolve it as quickly as possible.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newComplaint.subject}
                  onChange={(e) => setNewComplaint({...newComplaint, subject: e.target.value})}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newComplaint.category}
                  onValueChange={(value) => setNewComplaint({...newComplaint, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="canteen">Canteen</SelectItem>
                    <SelectItem value="library">Library</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newComplaint.priority}
                  onValueChange={(value) => setNewComplaint({...newComplaint, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                  placeholder="Detailed description of your complaint"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateComplaint}>Submit Complaint</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="my-complaints" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-complaints">My Complaints</TabsTrigger>
          {(user?.role === "admin" || user?.role === "warden") && (
            <TabsTrigger value="all-complaints">All Complaints</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-complaints" className="space-y-6">
          <div className="space-y-4">
            {filteredMyComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-soft transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getStatusIcon(complaint.status)}
                      <span>{complaint.subject}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                      <Badge variant={getStatusColor(complaint.status)}>
                        {complaint.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Category: {complaint.category} • Submitted on {format(new Date(complaint.created_at), "MMM dd, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {complaint.description}
                  </p>
                  
                  {complaint.resolution_notes && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="font-medium text-sm mb-1">Resolution:</div>
                      <p className="text-sm">{complaint.resolution_notes}</p>
                      {complaint.resolved_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Resolved on {format(new Date(complaint.resolved_at), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMyComplaints.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No complaints found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven't submitted any complaints yet.
              </p>
            </div>
          )}
        </TabsContent>

        {(user?.role === "admin" || user?.role === "warden") && (
          <TabsContent value="all-complaints" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="hover:shadow-medium transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(complaint.status)}
                        <Badge variant={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </div>
                      <Badge variant={getStatusColor(complaint.status)}>
                        {complaint.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{complaint.subject}</CardTitle>
                    <CardDescription>
                      {complaint.category} • {format(new Date(complaint.created_at), "MMM dd")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {complaint.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <User className="mr-1 h-3 w-3" />
                      Complaint ID: {complaint.id.slice(0, 8)}...
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {complaint.status === "pending" && (
                        <Button size="sm">
                          Assign
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredComplaints.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No complaints found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No complaints match your search criteria.
                </p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
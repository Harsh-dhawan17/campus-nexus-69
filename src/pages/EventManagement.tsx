import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, Users, Plus, Search, Filter } from "lucide-react";
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

interface EventManagementProps {
  user: User | null;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location?: string;
  capacity?: number;
  registered_count: number;
  registration_required: boolean;
  registration_deadline?: string;
  status: string;
  banner_url?: string;
  organizer_id: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registration_date: string;
  attendance_status: string;
  event: Event;
}

export default function EventManagement({ user }: EventManagementProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "academic",
    start_date: "",
    end_date: "",
    location: "",
    capacity: "",
    registration_required: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          *,
          event:events(*)
        `)
        .eq("user_id", user.id)
        .order("registration_date", { ascending: false });

      if (error) throw error;
      setMyRegistrations(data || []);
    } catch (error: any) {
      console.error("Error fetching registrations:", error);
    }
  };

  const handleCreateEvent = async () => {
    if (!user) return;
    
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        event_type: newEvent.event_type,
        start_date: new Date(newEvent.start_date).toISOString(),
        end_date: new Date(newEvent.end_date).toISOString(),
        location: newEvent.location,
        capacity: newEvent.capacity ? parseInt(newEvent.capacity) : null,
        registration_required: newEvent.registration_required,
        registration_deadline: newEvent.registration_required ? new Date(newEvent.start_date).toISOString() : null,
        organizer_id: user.id,
        status: "upcoming"
      };

      const { error } = await supabase
        .from("events")
        .insert([eventData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully!"
      });

      setIsCreateDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        event_type: "academic",
        start_date: "",
        end_date: "",
        location: "",
        capacity: "",
        registration_required: true
      });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const handleRegisterForEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("event_registrations")
        .insert([{
          event_id: eventId,
          user_id: user.id,
          attendance_status: "registered"
        }]);

      if (error) {
        if (error.code === "23505") { // Unique constraint violation
          toast({
            title: "Already Registered",
            description: "You are already registered for this event.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Successfully registered for the event!"
      });

      fetchEvents();
      fetchMyRegistrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive"
      });
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || event.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "default";
      case "ongoing": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "default";
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "academic": return "default";
      case "cultural": return "secondary";
      case "sports": return "outline";
      case "technical": return "default";
      default: return "outline";
    }
  };

  const isEventFull = (event: Event) => {
    return event.capacity && event.registered_count >= event.capacity;
  };

  const isRegistrationOpen = (event: Event) => {
    if (!event.registration_required) return false;
    if (event.registration_deadline) {
      return new Date() <= new Date(event.registration_deadline);
    }
    return new Date() <= new Date(event.start_date);
  };

  const isUserRegistered = (eventId: string) => {
    return myRegistrations.some(reg => reg.event_id === eventId);
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
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground">
            Discover and manage campus events
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "teacher") && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new campus event.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Event description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Event location"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all-events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all-events">All Events</TabsTrigger>
          <TabsTrigger value="my-events">My Registrations</TabsTrigger>
          {(user?.role === "admin" || user?.role === "teacher") && (
            <TabsTrigger value="manage">Manage Events</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all-events" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={getEventTypeColor(event.event_type)}>
                      {event.event_type}
                    </Badge>
                    <Badge variant={getEventStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(new Date(event.start_date), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {format(new Date(event.start_date), "h:mm a")}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                    {event.capacity && (
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {event.registered_count}/{event.capacity} registered
                      </div>
                    )}
                  </div>

                  {event.registration_required && (
                    <div className="pt-2">
                      {isUserRegistered(event.id) ? (
                        <Badge variant="secondary" className="w-full justify-center">
                          Already Registered
                        </Badge>
                      ) : isEventFull(event) ? (
                        <Badge variant="destructive" className="w-full justify-center">
                          Event Full
                        </Badge>
                      ) : !isRegistrationOpen(event) ? (
                        <Badge variant="outline" className="w-full justify-center">
                          Registration Closed
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleRegisterForEvent(event.id)}
                        >
                          Register Now
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No events found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No events match your search criteria.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-events" className="space-y-6">
          <div className="space-y-4">
            {myRegistrations.map((registration) => (
              <Card key={registration.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{registration.event.title}</h3>
                        <Badge variant={getEventStatusColor(registration.event.status)}>
                          {registration.event.status}
                        </Badge>
                        <Badge variant="secondary">
                          {registration.attendance_status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {format(new Date(registration.event.start_date), "MMM dd, yyyy")}
                        </div>
                        {registration.event.location && (
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            {registration.event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      Registered on {format(new Date(registration.registration_date), "MMM dd, yyyy")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myRegistrations.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No registrations found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven't registered for any events yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
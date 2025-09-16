import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Users, Bed, MapPin, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface HostelManagementProps {
  user: User | null;
}

interface Hostel {
  id: string;
  name: string;
  type: string;
  capacity: number;
  current_occupancy: number;
  address?: string;
  amenities?: string[];
  warden_id?: string;
}

interface Room {
  id: string;
  room_number: string;
  capacity: number;
  current_occupancy: number;
  rent_per_month?: number;
  status: string;
  amenities?: string[];
  hostel: {
    name: string;
  };
}

export default function HostelManagement({ user }: HostelManagementProps) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchHostels();
    fetchRooms();
  }, []);

  const fetchHostels = async () => {
    try {
      const { data, error } = await supabase
        .from("hostels")
        .select("*")
        .order("name");

      if (error) throw error;
      setHostels(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch hostels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select(`
          *,
          hostel:hostels(name)
        `)
        .order("room_number");

      if (error) throw error;
      setRooms(data || []);
    } catch (error: any) {
      console.error("Error fetching rooms:", error);
    }
  };

  const filteredHostels = hostels.filter(hostel =>
    hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hostel.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = rooms.filter(room =>
    room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.hostel?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOccupancyColor = (current: number, total: number) => {
    const percentage = (current / total) * 100;
    if (percentage >= 90) return "destructive";
    if (percentage >= 70) return "secondary";
    return "default";
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case "available": return "default";
      case "occupied": return "secondary";
      case "maintenance": return "destructive";
      default: return "outline";
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Hostel Management</h1>
          <p className="text-muted-foreground">
            Manage hostels, rooms, and accommodations
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "warden") && (
          <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
            <Plus className="mr-2 h-4 w-4" />
            Add Hostel
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hostels or rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="hostels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hostels">Hostels Overview</TabsTrigger>
          <TabsTrigger value="rooms">Room Details</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="hostels" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHostels.map((hostel) => (
              <Card key={hostel.id} className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      <Building className="mr-2 h-5 w-5 text-primary" />
                      {hostel.name}
                    </CardTitle>
                    <Badge variant="outline">{hostel.type}</Badge>
                  </div>
                  {hostel.address && (
                    <CardDescription className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {hostel.address}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Occupancy</span>
                    <Badge variant={getOccupancyColor(hostel.current_occupancy, hostel.capacity)}>
                      {hostel.current_occupancy}/{hostel.capacity}
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((hostel.current_occupancy / hostel.capacity) * 100, 100)}%` 
                      }}
                    />
                  </div>

                  {hostel.amenities && hostel.amenities.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Amenities:</span>
                      <div className="flex flex-wrap gap-1">
                        {hostel.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {hostel.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{hostel.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    {(user?.role === "admin" || user?.role === "warden") && (
                      <Button size="sm">Manage</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredHostels.length === 0 && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No hostels found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No hostels match your search criteria.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <div className="grid gap-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-soft transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Bed className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Room {room.room_number}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {room.hostel?.name}
                      </span>
                      <Badge variant={getRoomStatusColor(room.status)}>
                        {room.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Occupancy</div>
                        <div className="font-semibold">
                          {room.current_occupancy}/{room.capacity}
                        </div>
                      </div>
                      
                      {room.rent_per_month && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Rent</div>
                          <div className="font-semibold">₹{room.rent_per_month}/month</div>
                        </div>
                      )}
                      
                      {(user?.role === "admin" || user?.role === "warden") && (
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {room.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <Bed className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No rooms found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No rooms match your search criteria.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Overall Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {hostels.reduce((sum, h) => sum + h.current_occupancy, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {hostels.reduce((sum, h) => sum + h.capacity, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Capacity</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Occupancy</span>
                    <span className="font-medium">
                      {Math.round((hostels.reduce((sum, h) => sum + h.current_occupancy, 0) / 
                        hostels.reduce((sum, h) => sum + h.capacity, 0)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(hostels.reduce((sum, h) => sum + h.current_occupancy, 0) / 
                          hostels.reduce((sum, h) => sum + h.capacity, 0)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hostel-wise Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hostels.map((hostel) => (
                    <div key={hostel.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{hostel.name}</div>
                        <div className="text-sm text-muted-foreground">{hostel.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {Math.round((hostel.current_occupancy / hostel.capacity) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {hostel.current_occupancy}/{hostel.capacity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
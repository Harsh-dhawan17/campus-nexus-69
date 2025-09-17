import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useRealtimeAttendance() {
  const [attendanceUpdated, setAttendanceUpdated] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance'
        },
        (payload) => {
          console.log('New attendance record:', payload);
          setAttendanceUpdated(prev => prev + 1);
          toast({
            title: "Attendance Updated",
            description: "A new attendance record has been added."
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return attendanceUpdated;
}

export function useRealtimeEvents() {
  const [eventsUpdated, setEventsUpdated] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('Event updated:', payload);
          setEventsUpdated(prev => prev + 1);
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Event Added",
              description: "A new event has been created."
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return eventsUpdated;
}

export function useRealtimeComplaints() {
  const [complaintsUpdated, setComplaintsUpdated] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('complaints-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints'
        },
        (payload) => {
          console.log('Complaint updated:', payload);
          setComplaintsUpdated(prev => prev + 1);
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Complaint Filed",
              description: "A new complaint has been submitted."
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Complaint Updated",
              description: "A complaint status has been updated."
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return complaintsUpdated;
}
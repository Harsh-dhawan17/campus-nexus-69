-- Create notifications table for real-time alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  category TEXT NOT NULL, -- attendance, event, complaint, general
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create student_updates table for daily updates from staff
CREATE TABLE public.student_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  update_type TEXT NOT NULL, -- academic, disciplinary, general, attendance
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT DEFAULT 'active', -- active, resolved, archived
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table for campus-wide announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT[] DEFAULT '{"all"}', -- all, students, staff, admins, or specific roles
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Staff and admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
));

-- RLS Policies for student_updates
CREATE POLICY "Students can view their own updates" 
ON public.student_updates 
FOR SELECT 
USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
       OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')));

CREATE POLICY "Staff and admins can manage student updates" 
ON public.student_updates 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')));

-- RLS Policies for announcements
CREATE POLICY "Everyone can view active announcements" 
ON public.announcements 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Staff and admins can manage announcements" 
ON public.announcements 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('staff', 'admin')));

-- Add realtime functionality
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.student_updates REPLICA IDENTITY FULL;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;

-- Create function to auto-create notifications for important events
CREATE OR REPLACE FUNCTION public.create_attendance_notification()
RETURNS TRIGGER AS $$
DECLARE
  student_profile public.profiles%ROWTYPE;
BEGIN
  -- Get student profile
  SELECT * INTO student_profile FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification for student
  INSERT INTO public.notifications (user_id, title, message, type, category, metadata)
  VALUES (
    student_profile.user_id,
    'Attendance Marked',
    'Your attendance has been marked for ' || NEW.class_subject || ' - ' || NEW.status,
    CASE WHEN NEW.status = 'present' THEN 'success' ELSE 'warning' END,
    'attendance',
    jsonb_build_object('class_subject', NEW.class_subject, 'status', NEW.status, 'date', NEW.date)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for attendance notifications
CREATE TRIGGER attendance_notification_trigger
  AFTER INSERT ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.create_attendance_notification();

-- Create function for event registration notifications
CREATE OR REPLACE FUNCTION public.create_event_notification()
RETURNS TRIGGER AS $$
DECLARE
  event_record public.events%ROWTYPE;
  student_profile public.profiles%ROWTYPE;
BEGIN
  -- Get event and student details
  SELECT * INTO event_record FROM public.events WHERE id = NEW.event_id;
  SELECT * INTO student_profile FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification for student
  INSERT INTO public.notifications (user_id, title, message, type, category, metadata)
  VALUES (
    student_profile.user_id,
    'Event Registration Confirmed',
    'You have successfully registered for: ' || event_record.title,
    'success',
    'event',
    jsonb_build_object('event_id', NEW.event_id, 'event_title', event_record.title)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for event registration notifications
CREATE TRIGGER event_registration_notification_trigger
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_event_notification();

-- Update updated_at trigger for student_updates
CREATE TRIGGER update_student_updates_updated_at
  BEFORE UPDATE ON public.student_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at trigger for announcements
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
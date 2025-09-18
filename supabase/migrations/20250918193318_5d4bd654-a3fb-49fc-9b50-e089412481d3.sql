-- Fix security issues by properly dropping and recreating functions with correct search path

-- Drop triggers first, then functions, then recreate with proper search path
DROP TRIGGER IF EXISTS attendance_notification_trigger ON public.attendance;
DROP TRIGGER IF EXISTS event_registration_notification_trigger ON public.event_registrations;

DROP FUNCTION IF EXISTS public.create_attendance_notification() CASCADE;
DROP FUNCTION IF EXISTS public.create_event_notification() CASCADE;

-- Recreate functions with proper search path
CREATE OR REPLACE FUNCTION public.create_attendance_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.create_event_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

-- Recreate triggers
CREATE TRIGGER attendance_notification_trigger
  AFTER INSERT ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.create_attendance_notification();

CREATE TRIGGER event_registration_notification_trigger
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_event_notification();

-- Add missing RLS policies for rooms table
CREATE POLICY "Everyone can view rooms" 
ON public.rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Only wardens and admins can modify rooms" 
ON public.rooms 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'warden')));

-- Add missing policies for notifications table - allow updates for marking as read
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Add policy for attendance QR codes - students should be able to view active QR codes
CREATE POLICY "Students can view active QR codes" 
ON public.attendance_qr_codes 
FOR SELECT 
USING (is_active = true AND expires_at > now());
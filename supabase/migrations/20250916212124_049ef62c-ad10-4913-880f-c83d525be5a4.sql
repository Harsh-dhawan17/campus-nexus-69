-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  year INTEGER,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin', 'warden')),
  avatar_url TEXT,
  hostel_id UUID,
  room_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hostels table
CREATE TABLE public.hostels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('boys', 'girls', 'mixed')),
  capacity INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  warden_id UUID REFERENCES public.profiles(id),
  amenities TEXT[],
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  rent_per_month DECIMAL(10,2),
  amenities TEXT[],
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hostel_id, room_number)
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('academic', 'cultural', 'sports', 'technical', 'fest', 'workshop', 'seminar')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  capacity INTEGER,
  registered_count INTEGER DEFAULT 0,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent')),
  UNIQUE(event_id, user_id)
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('hostel', 'academic', 'mess', 'transport', 'infrastructure', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_subject TEXT NOT NULL,
  class_type TEXT NOT NULL CHECK (class_type IN ('lecture', 'practical', 'tutorial')),
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES public.profiles(id),
  marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location TEXT,
  qr_code_id TEXT,
  UNIQUE(user_id, class_subject, date, time_slot)
);

-- Create QR codes table for attendance
CREATE TABLE public.attendance_qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  class_subject TEXT NOT NULL,
  class_type TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  location TEXT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint for hostel_id in profiles
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_hostel 
  FOREIGN KEY (hostel_id) REFERENCES public.hostels(id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for hostels
CREATE POLICY "Everyone can view hostels" ON public.hostels
  FOR SELECT USING (true);

CREATE POLICY "Only wardens and admins can modify hostels" ON public.hostels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'warden')
    )
  );

-- RLS Policies for events
CREATE POLICY "Everyone can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Organizers and admins can modify events" ON public.events
  FOR ALL USING (
    organizer_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for event registrations
CREATE POLICY "Users can view their own registrations" ON public.event_registrations
  FOR SELECT USING (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for complaints
CREATE POLICY "Users can view their own complaints" ON public.complaints
  FOR SELECT USING (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'warden')
    )
  );

CREATE POLICY "Users can create complaints" ON public.complaints
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for attendance
CREATE POLICY "Users can view their own attendance" ON public.attendance
  FOR SELECT USING (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can mark attendance" ON public.attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- RLS Policies for QR codes
CREATE POLICY "Teachers can manage QR codes" ON public.attendance_qr_codes
  FOR ALL USING (
    teacher_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hostels_updated_at
  BEFORE UPDATE ON public.hostels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'student_id', 'TEMP_' || substring(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
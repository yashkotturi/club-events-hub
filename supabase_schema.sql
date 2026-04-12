-- Database Schema for Club Events Hub

-- 1. Profiles table (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'club_admin', 'super_admin')),
  university_id TEXT,
  phone TEXT,
  whatsapp_opt_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clubs table
CREATE TABLE clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  logo_url TEXT,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  capacity INTEGER DEFAULT 100,
  image_url TEXT,
  category TEXT,
  registration_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Registrations table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  checked_in_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 5. Row Level Security (RLS)

-- Profiles: Users can view all profiles, but only edit their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Clubs: Everyone can view, only admins can create/edit their own
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clubs are viewable by everyone" ON clubs FOR SELECT USING (true);
CREATE POLICY "Club admins can manage their own clubs" ON clubs 
  FOR ALL USING (auth.uid() = admin_id);

-- Events: Everyone can view, only club admins can edit their own club's events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Club admins can manage their own events" ON events 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clubs 
      WHERE clubs.id = events.club_id AND clubs.admin_id = auth.uid()
    )
  );

-- Registrations: 
-- 1. Users can view and manage their own registrations
-- 2. Club admins can view and manage registrations for their events
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register themselves" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own registration" ON registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all registrations for their events" ON registrations 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN clubs ON events.club_id = clubs.id
      WHERE events.id = registrations.event_id AND clubs.admin_id = auth.uid()
    )
  );
CREATE POLICY "Admins can check-in attendees" ON registrations 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      JOIN clubs ON events.club_id = clubs.id
      WHERE events.id = registrations.event_id AND clubs.admin_id = auth.uid()
    )
  );

-- 6. Trigger for profile creation on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RoadSide+ Trinidad & Tobago Database Schema
-- This file contains the complete database schema for the roadside assistance platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom types
CREATE TYPE user_role AS ENUM ('customer', 'technician', 'admin', 'partner', 'security', 'super_admin');
CREATE TYPE service_type AS ENUM ('towing', 'battery', 'tire', 'lockout', 'fuel', 'winch');
CREATE TYPE request_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'emergency');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE technician_status AS ENUM ('available', 'busy', 'offline', 'emergency');
CREATE TYPE specialization AS ENUM ('towing', 'battery', 'tire', 'lockout', 'fuel', 'winch', 'mechanical', 'electrical');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer',
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table (for partner companies)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  website_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type service_type NOT NULL,
  description TEXT,
  base_price_ttd DECIMAL(10, 2) NOT NULL,
  estimated_duration_minutes INTEGER DEFAULT 60,
  is_emergency_available BOOLEAN DEFAULT TRUE,
  emergency_surcharge_percent DECIMAL(5, 2) DEFAULT 50.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technicians table
CREATE TABLE technicians (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  license_number TEXT UNIQUE,
  specializations specialization[] DEFAULT '{}',
  status technician_status DEFAULT 'offline',
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  current_accuracy DECIMAL(8, 2),
  current_speed DECIMAL(8, 2),
  current_heading DECIMAL(8, 2),
  last_location_update TIMESTAMP WITH TIME ZONE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  vehicle_info JSONB,
  is_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service requests table
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technicians(id),
  service_id UUID NOT NULL REFERENCES services(id),
  service_type service_type NOT NULL,
  status request_status DEFAULT 'pending',
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT,
  description TEXT,
  emergency BOOLEAN DEFAULT FALSE,
  estimated_price_ttd DECIMAL(10, 2),
  final_price_ttd DECIMAL(10, 2),
  estimated_arrival_time TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ttd DECIMAL(10, 2) NOT NULL,
  platform_fee_ttd DECIMAL(10, 2) DEFAULT 0.00,
  vat_ttd DECIMAL(10, 2) DEFAULT 0.00,
  total_amount_ttd DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  status payment_status DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (for tracking)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES service_requests(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  speed DECIMAL(8, 2),
  heading DECIMAL(8, 2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency alerts table
CREATE TABLE emergency_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT,
  alert_type TEXT NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location_lat, location_lng);
CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_technicians_location ON technicians(current_lat, current_lng);
CREATE INDEX idx_technicians_specializations ON technicians USING GIN(specializations);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_service_requests_technician ON service_requests(technician_id);
CREATE INDEX idx_service_requests_location ON service_requests(location_lat, location_lng);
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_locations_technician_time ON locations(technician_id, recorded_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Service requests policies
CREATE POLICY "Customers can view own requests" ON service_requests
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Technicians can view assigned requests" ON service_requests
  FOR SELECT USING (auth.uid() = technician_id);

CREATE POLICY "Admins can view all requests" ON service_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Customers can create requests" ON service_requests
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Technicians can update assigned requests" ON service_requests
  FOR UPDATE USING (auth.uid() = technician_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Reviews policies
CREATE POLICY "Users can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Technician location policies
CREATE POLICY "Technicians can update own location" ON technicians
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view technician locations" ON technicians
  FOR SELECT USING (true);

-- Location tracking policies
CREATE POLICY "Technicians can insert location data" ON locations
  FOR INSERT WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "Users can view location data" ON locations
  FOR SELECT USING (true);

-- Emergency alerts policies
CREATE POLICY "Users can create emergency alerts" ON emergency_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Emergency responders can view alerts" ON emergency_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('security', 'admin', 'super_admin')
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions for business logic
CREATE OR REPLACE FUNCTION calculate_ttd_total(base_amount DECIMAL)
RETURNS TABLE(
  base_amount_ttd DECIMAL,
  platform_fee_ttd DECIMAL,
  vat_ttd DECIMAL,
  total_amount_ttd DECIMAL
) AS $$
BEGIN
  RETURN QUERY SELECT
    base_amount,
    ROUND(base_amount * 0.05, 2) as platform_fee_ttd,
    ROUND((base_amount + (base_amount * 0.05)) * 0.125, 2) as vat_ttd,
    ROUND(base_amount + (base_amount * 0.05) + ((base_amount + (base_amount * 0.05)) * 0.125), 2) as total_amount_ttd;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby technicians
CREATE OR REPLACE FUNCTION get_nearby_technicians(
  latitude DECIMAL,
  longitude DECIMAL,
  radius_km INTEGER DEFAULT 10,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  full_name TEXT,
  phone TEXT,
  specializations specialization[],
  status technician_status,
  current_lat DECIMAL,
  current_lng DECIMAL,
  rating DECIMAL,
  total_jobs INTEGER,
  completed_jobs INTEGER,
  vehicle_info JSONB,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    u.id as user_id,
    u.full_name,
    u.phone,
    t.specializations,
    t.status,
    t.current_lat,
    t.current_lng,
    t.rating,
    t.total_jobs,
    t.completed_jobs,
    t.vehicle_info,
    ROUND(
      (6371 * acos(
        cos(radians(latitude)) *
        cos(radians(t.current_lat)) *
        cos(radians(t.current_lng) - radians(longitude)) +
        sin(radians(latitude)) *
        sin(radians(t.current_lat))
      ))::numeric, 2
    ) as distance_km
  FROM technicians t
  JOIN users u ON t.id = u.id
  WHERE
    t.is_available = true
    AND t.current_lat IS NOT NULL
    AND t.current_lng IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(latitude)) *
        cos(radians(t.current_lat)) *
        cos(radians(t.current_lng) - radians(longitude)) +
        sin(radians(latitude)) *
        sin(radians(t.current_lat))
      )
    ) <= radius_km
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update technician rating after review
CREATE OR REPLACE FUNCTION update_technician_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE technicians
  SET
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE technician_id = NEW.technician_id
    ),
    updated_at = NOW()
  WHERE id = NEW.technician_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update technician rating when review is added
CREATE TRIGGER update_technician_rating_trigger
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_rating();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_alerts_updated_at BEFORE UPDATE ON emergency_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

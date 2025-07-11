-- Sample data for RoadSide+ Trinidad & Tobago
-- This file contains sample data for testing and development

-- Insert sample organizations
INSERT INTO organizations (id, name, description, contact_email, contact_phone, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Trinidad Auto Rescue', 'Leading roadside assistance provider in Trinidad', 'info@trinidadautorescue.com', '+1-868-555-0101', 'Port of Spain, Trinidad'),
('550e8400-e29b-41d4-a716-446655440002', 'Tobago Emergency Services', 'Emergency roadside services for Tobago', 'help@tobagoems.com', '+1-868-555-0102', 'Scarborough, Tobago'),
('550e8400-e29b-41d4-a716-446655440003', 'Island Wide Towing', 'Comprehensive towing services across both islands', 'contact@islandwidetowing.tt', '+1-868-555-0103', 'San Fernando, Trinidad');

-- Insert sample services
INSERT INTO services (id, name, type, description, base_price_ttd, estimated_duration_minutes, emergency_surcharge_percent) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Vehicle Towing', 'towing', 'Professional towing service to nearest garage or location of choice', 150.00, 45, 50.00),
('650e8400-e29b-41d4-a716-446655440002', 'Battery Jump Start', 'battery', 'Jump start service for dead car batteries', 75.00, 30, 50.00),
('650e8400-e29b-41d4-a716-446655440003', 'Tire Change Service', 'tire', 'Flat tire replacement with spare tire', 100.00, 30, 50.00),
('650e8400-e29b-41d4-a716-446655440004', 'Car Lockout Service', 'lockout', 'Professional lockout service to regain access to your vehicle', 125.00, 25, 50.00),
('650e8400-e29b-41d4-a716-446655440005', 'Emergency Fuel Delivery', 'fuel', 'Fuel delivery service when you run out of gas', 80.00, 35, 50.00),
('650e8400-e29b-41d4-a716-446655440006', 'Winch Out Service', 'winch', 'Vehicle recovery from ditches, mud, or stuck situations', 200.00, 60, 50.00);

-- Note: Sample users and technicians would be created through the application
-- as they require authentication through Supabase Auth

-- Sample service requests (these would reference real user IDs in production)
-- INSERT INTO service_requests (id, customer_id, service_id, service_type, location_lat, location_lng, location_address, description, estimated_price_ttd) VALUES
-- ('750e8400-e29b-41d4-a716-446655440001', 'user-uuid-here', '650e8400-e29b-41d4-a716-446655440001', 'towing', 10.6918, -61.2225, 'Port of Spain, Trinidad', 'Car broke down on highway', 150.00);

-- Sample emergency contact numbers for Trinidad & Tobago
-- These would be used in the application configuration
-- Emergency: 999
-- Police: 999  
-- Fire Service: 990
-- Ambulance: 811
-- Coast Guard: 634-4440

-- Sample locations in Trinidad & Tobago for testing
-- Port of Spain: 10.6918, -61.2225
-- San Fernando: 10.2796, -61.4589
-- Arima: 10.6372, -61.2828
-- Chaguanas: 10.5155, -61.4094
-- Scarborough, Tobago: 11.1817, -60.7393
-- Crown Point, Tobago: 11.1497, -60.8362

-- Function to create sample technician data (to be run after user creation)
CREATE OR REPLACE FUNCTION create_sample_technicians()
RETURNS void AS $$
DECLARE
  tech_user_id UUID;
BEGIN
  -- This function would be called after creating sample users through Supabase Auth
  -- It creates corresponding technician records
  
  -- Sample technician specializations and locations around Trinidad & Tobago
  -- Port of Spain area technician
  -- INSERT INTO technicians (id, organization_id, license_number, specializations, status, current_lat, current_lng, rating, total_jobs, completed_jobs, vehicle_info, is_available)
  -- VALUES (tech_user_id, '550e8400-e29b-41d4-a716-446655440001', 'TT-TECH-001', ARRAY['towing', 'battery', 'tire']::specialization[], 'available', 10.6918, -61.2225, 4.8, 150, 142, '{"make": "Ford", "model": "F-150", "color": "Blue", "plate": "TBH-1234"}', true);
  
  RAISE NOTICE 'Sample technicians would be created here after user authentication setup';
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing payment calculations
SELECT * FROM calculate_ttd_total(100.00); -- Test TTD fee calculation

-- Sample data for testing nearby technicians (requires actual technician data)
-- SELECT * FROM get_nearby_technicians(10.6918, -61.2225, 10, 5); -- Port of Spain area

-- Insert sample notifications templates
-- These would be used by the notification service
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO notification_templates (name, title_template, message_template, type) VALUES
('service_request_created', 'Service Request Created', 'Your {{service_type}} request has been created. Request ID: {{request_id}}', 'service_update'),
('technician_assigned', 'Technician Assigned', '{{technician_name}} has been assigned to your {{service_type}} request. ETA: {{eta}} minutes', 'service_update'),
('technician_en_route', 'Technician En Route', 'Your technician is on the way! Track their progress in the app.', 'service_update'),
('service_started', 'Service Started', 'Your technician has started working on your {{service_type}} request.', 'service_update'),
('service_completed', 'Service Completed', 'Your {{service_type}} service has been completed. Please rate your experience.', 'service_update'),
('payment_processed', 'Payment Processed', 'Payment of ${{amount}} TTD has been processed successfully.', 'payment'),
('emergency_alert', 'Emergency Alert', 'Emergency assistance request received at {{location}}. Dispatching help immediately.', 'emergency');

-- Sample emergency alert types
CREATE TABLE IF NOT EXISTS emergency_alert_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 1,
  auto_dispatch BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO emergency_alert_types (name, description, priority, auto_dispatch) VALUES
('vehicle_accident', 'Vehicle accident requiring immediate assistance', 1, true),
('medical_emergency', 'Medical emergency during roadside assistance', 1, true),
('vehicle_fire', 'Vehicle fire or smoke', 1, true),
('stranded_unsafe', 'Stranded in unsafe location', 2, false),
('severe_weather', 'Assistance needed due to severe weather conditions', 2, false),
('general_emergency', 'General emergency situation', 3, false);

-- Sample vehicle makes and models for Trinidad & Tobago market
CREATE TABLE IF NOT EXISTS vehicle_makes_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year_from INTEGER,
  year_to INTEGER,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO vehicle_makes_models (make, model, year_from, year_to, is_popular) VALUES
-- Popular vehicles in Trinidad & Tobago
('Toyota', 'Corolla', 2000, 2024, true),
('Toyota', 'Camry', 2000, 2024, true),
('Toyota', 'RAV4', 2005, 2024, true),
('Honda', 'Civic', 2000, 2024, true),
('Honda', 'Accord', 2000, 2024, true),
('Honda', 'CR-V', 2005, 2024, true),
('Nissan', 'Sentra', 2000, 2024, true),
('Nissan', 'Altima', 2000, 2024, true),
('Nissan', 'X-Trail', 2005, 2024, true),
('Hyundai', 'Elantra', 2005, 2024, true),
('Hyundai', 'Tucson', 2010, 2024, true),
('Kia', 'Forte', 2010, 2024, true),
('Kia', 'Sportage', 2010, 2024, true),
('Ford', 'Focus', 2000, 2020, false),
('Ford', 'Escape', 2005, 2024, false),
('Chevrolet', 'Cruze', 2010, 2020, false),
('Mitsubishi', 'Lancer', 2000, 2020, true),
('Mitsubishi', 'Outlander', 2005, 2024, false),
('Suzuki', 'Swift', 2005, 2024, true),
('Suzuki', 'Vitara', 2005, 2024, false);

-- Sample service areas (parishes/regions in Trinidad & Tobago)
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  island TEXT NOT NULL CHECK (island IN ('Trinidad', 'Tobago')),
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO service_areas (name, island, center_lat, center_lng, radius_km) VALUES
-- Trinidad parishes/regions
('Port of Spain', 'Trinidad', 10.6918, -61.2225, 15),
('San Fernando', 'Trinidad', 10.2796, -61.4589, 20),
('Arima', 'Trinidad', 10.6372, -61.2828, 15),
('Chaguanas', 'Trinidad', 10.5155, -61.4094, 15),
('Point Fortin', 'Trinidad', 10.1833, -61.6833, 10),
('Sangre Grande', 'Trinidad', 10.5833, -61.1333, 15),
('Tunapuna-Piarco', 'Trinidad', 10.6500, -61.3833, 20),
('Penal-Debe', 'Trinidad', 10.1667, -61.4500, 15),
('Princes Town', 'Trinidad', 10.2667, -61.3667, 15),
('Rio Claro-Mayaro', 'Trinidad', 10.3000, -61.1667, 25),
('Siparia', 'Trinidad', 10.1500, -61.5000, 15),
('Couva-Tabaquite-Talparo', 'Trinidad', 10.4167, -61.4333, 20),
('Diego Martin', 'Trinidad', 10.7333, -61.5500, 10),
-- Tobago regions
('Scarborough', 'Tobago', 11.1817, -60.7393, 15),
('Crown Point', 'Tobago', 11.1497, -60.8362, 10),
('Roxborough', 'Tobago', 11.2667, -60.5833, 15),
('Plymouth', 'Tobago', 11.2167, -60.7833, 10);

-- Create indexes for sample data tables
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_models_popular ON vehicle_makes_models(is_popular);
CREATE INDEX IF NOT EXISTS idx_service_areas_island ON service_areas(island);
CREATE INDEX IF NOT EXISTS idx_service_areas_active ON service_areas(is_active);

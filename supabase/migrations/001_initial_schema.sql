-- RoadSide+ Trinidad & Tobago Database Schema
-- Initial migration with tables, RLS policies, and storage setup

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('customer', 'technician', 'admin', 'super_admin', 'partner', 'security');
create type service_type as enum ('towing', 'battery', 'tire', 'lockout', 'fuel', 'mechanical', 'accident');
create type request_status as enum ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'emergency');
create type payment_status as enum ('pending', 'processing', 'completed', 'failed', 'refunded');
create type technician_status as enum ('available', 'busy', 'offline', 'emergency');

-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  role user_role default 'customer',
  avatar_url text,
  location_lat decimal,
  location_lng decimal,
  address text,
  emergency_contact text,
  emergency_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Organizations table (for partners, security companies, etc.)
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null, -- 'partner', 'security', 'insurance'
  contact_email text,
  contact_phone text,
  address text,
  license_number text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Services table
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type service_type not null,
  description text,
  base_price_ttd decimal(10,2) not null, -- Trinidad & Tobago Dollars
  estimated_duration_minutes integer,
  active boolean default true,
  emergency_surcharge_percent decimal(5,2) default 50.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Service requests table
create table public.service_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  service_id uuid references public.services(id) not null,
  technician_id uuid references public.users(id),
  status request_status default 'pending',
  service_type service_type not null,
  location_lat decimal(9,6) not null,
  location_lng decimal(9,6) not null,
  location_address text,
  description text,
  emergency boolean default false,
  estimated_price_ttd decimal(10,2),
  final_price_ttd decimal(10,2),
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  cancellation_reason text,
  customer_rating integer check (customer_rating >= 1 and customer_rating <= 5),
  customer_feedback text,
  technician_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Technicians table (additional info for technician users)
create table public.technicians (
  id uuid references public.users(id) on delete cascade primary key,
  license_number text unique,
  specializations service_type[],
  status technician_status default 'offline',
  current_lat decimal(9,6),
  current_lng decimal(9,6),
  vehicle_info jsonb, -- {make, model, year, plate, color}
  rating decimal(3,2) default 0.00,
  total_jobs integer default 0,
  active boolean default true,
  organization_id uuid references public.organizations(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  service_request_id uuid references public.service_requests(id) not null,
  user_id uuid references public.users(id) not null,
  stripe_payment_intent_id text unique,
  amount_ttd decimal(10,2) not null,
  platform_fee_ttd decimal(10,2) default 0.00,
  processing_fee_ttd decimal(10,2) default 0.00,
  vat_ttd decimal(10,2) default 0.00, -- 12.5% VAT for Trinidad & Tobago
  total_amount_ttd decimal(10,2) not null,
  status payment_status default 'pending',
  payment_method text, -- 'card', 'linx', 'wired', etc.
  processed_at timestamp with time zone,
  refunded_at timestamp with time zone,
  refund_amount_ttd decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Locations table (for tracking technician movement)
create table public.locations (
  id uuid default uuid_generate_v4() primary key,
  technician_id uuid references public.technicians(id) not null,
  service_request_id uuid references public.service_requests(id),
  latitude decimal(9,6) not null,
  longitude decimal(9,6) not null,
  accuracy decimal(8,2),
  speed decimal(8,2),
  heading decimal(5,2),
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null, -- 'service_update', 'payment', 'emergency', 'system'
  data jsonb, -- additional notification data
  read boolean default false,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reviews table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  service_request_id uuid references public.service_requests(id) not null,
  customer_id uuid references public.users(id) not null,
  technician_id uuid references public.users(id) not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Emergency alerts table
create table public.emergency_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  service_request_id uuid references public.service_requests(id),
  alert_type text not null, -- 'sos', 'accident', 'medical', 'security'
  location_lat decimal(9,6) not null,
  location_lng decimal(9,6) not null,
  location_address text,
  description text,
  status text default 'active', -- 'active', 'responded', 'resolved'
  responded_by uuid references public.users(id),
  responded_at timestamp with time zone,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- File uploads table
create table public.file_uploads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  service_request_id uuid references public.service_requests(id),
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size integer,
  upload_type text not null, -- 'service_photo', 'document', 'profile_image'
  public_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_service_requests_user_id on public.service_requests(user_id);
create index idx_service_requests_technician_id on public.service_requests(technician_id);
create index idx_service_requests_status on public.service_requests(status);
create index idx_service_requests_created_at on public.service_requests(created_at);
create index idx_locations_technician_id on public.locations(technician_id);
create index idx_locations_timestamp on public.locations(timestamp);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(read);
create index idx_payments_service_request_id on public.payments(service_request_id);
create index idx_payments_user_id on public.payments(user_id);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.service_requests enable row level security;
alter table public.technicians enable row level security;
alter table public.payments enable row level security;
alter table public.locations enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.emergency_alerts enable row level security;
alter table public.file_uploads enable row level security;

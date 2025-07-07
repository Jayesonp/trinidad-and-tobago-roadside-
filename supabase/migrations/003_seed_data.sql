-- Seed data for RoadSide+ Trinidad & Tobago
-- Initial services, organizations, and sample data

-- Insert default services with Trinidad & Tobago pricing
insert into public.services (name, type, description, base_price_ttd, estimated_duration_minutes, emergency_surcharge_percent) values
('Emergency Towing', 'towing', 'Vehicle towing to nearest service center or preferred location', 200.00, 45, 50.00),
('Battery Jump Start', 'battery', 'Jump start your vehicle battery on-site', 80.00, 20, 25.00),
('Flat Tire Change', 'tire', 'Change flat tire with your spare tire', 60.00, 25, 30.00),
('Vehicle Lockout Service', 'lockout', 'Unlock your vehicle safely without damage', 50.00, 15, 40.00),
('Emergency Fuel Delivery', 'fuel', 'Deliver fuel to your location (fuel cost separate)', 40.00, 30, 20.00),
('Basic Mechanical Assistance', 'mechanical', 'On-site mechanical troubleshooting and minor repairs', 120.00, 60, 35.00),
('Accident Recovery', 'accident', 'Vehicle recovery and towing after accidents', 250.00, 60, 75.00);

-- Insert sample organizations
insert into public.organizations (name, type, contact_email, contact_phone, address, license_number, active) values
('Trinidad Towing Services Ltd.', 'partner', 'info@trinidadtowing.tt', '+1-868-555-0101', 'Port of Spain, Trinidad', 'TTS-2024-001', true),
('Tobago Roadside Rescue', 'partner', 'help@tobagorescue.tt', '+1-868-555-0102', 'Scarborough, Tobago', 'TRR-2024-002', true),
('Guardian Security Services', 'security', 'emergency@guardian.tt', '+1-868-555-0201', 'San Fernando, Trinidad', 'GSS-2024-001', true),
('Island Emergency Response', 'security', 'response@islandemergency.tt', '+1-868-555-0202', 'Chaguanas, Trinidad', 'IER-2024-002', true),
('TTIP Insurance Partners', 'insurance', 'claims@ttip.tt', '+1-868-555-0301', 'Port of Spain, Trinidad', 'TTIP-2024-001', true);

-- Create functions for automatic timestamp updates
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at columns
create trigger handle_users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_organizations_updated_at
  before update on public.organizations
  for each row execute procedure public.handle_updated_at();

create trigger handle_services_updated_at
  before update on public.services
  for each row execute procedure public.handle_updated_at();

create trigger handle_service_requests_updated_at
  before update on public.service_requests
  for each row execute procedure public.handle_updated_at();

create trigger handle_technicians_updated_at
  before update on public.technicians
  for each row execute procedure public.handle_updated_at();

create trigger handle_payments_updated_at
  before update on public.payments
  for each row execute procedure public.handle_updated_at();

-- Create function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'customer')::user_role
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to calculate TTD fees including VAT
create or replace function public.calculate_ttd_total(base_amount decimal)
returns jsonb as $$
declare
  platform_fee decimal := base_amount * 0.05; -- 5% platform fee
  processing_fee decimal := base_amount * 0.029 + 0.30; -- Stripe fees
  subtotal decimal := base_amount + platform_fee + processing_fee;
  vat decimal := subtotal * 0.125; -- 12.5% VAT for Trinidad & Tobago
  total decimal := subtotal + vat;
begin
  return jsonb_build_object(
    'base_amount', round(base_amount, 2),
    'platform_fee', round(platform_fee, 2),
    'processing_fee', round(processing_fee, 2),
    'vat', round(vat, 2),
    'total_amount', round(total, 2)
  );
end;
$$ language plpgsql;

-- Create function to get nearby available technicians
create or replace function public.get_nearby_technicians(
  user_lat decimal,
  user_lng decimal,
  service_type_param service_type,
  radius_km decimal default 50
)
returns table (
  technician_id uuid,
  full_name text,
  phone text,
  rating decimal,
  distance_km decimal,
  current_lat decimal,
  current_lng decimal,
  specializations service_type[]
) as $$
begin
  return query
  select 
    t.id,
    u.full_name,
    u.phone,
    t.rating,
    round(
      (6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(t.current_lat)) * 
        cos(radians(t.current_lng) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(t.current_lat))
      ))::decimal, 2
    ) as distance_km,
    t.current_lat,
    t.current_lng,
    t.specializations
  from public.technicians t
  join public.users u on u.id = t.id
  where 
    t.status = 'available'
    and t.active = true
    and u.role = 'technician'
    and (service_type_param = any(t.specializations) or array_length(t.specializations, 1) is null)
    and t.current_lat is not null
    and t.current_lng is not null
    and (
      6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(t.current_lat)) * 
        cos(radians(t.current_lng) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(t.current_lat))
      )
    ) <= radius_km
  order by distance_km asc, t.rating desc
  limit 10;
end;
$$ language plpgsql;

-- Create function to update technician rating
create or replace function public.update_technician_rating()
returns trigger as $$
declare
  avg_rating decimal;
  job_count integer;
begin
  -- Calculate new average rating and job count
  select 
    coalesce(avg(rating), 0),
    count(*)
  into avg_rating, job_count
  from public.reviews
  where technician_id = new.technician_id;

  -- Update technician record
  update public.technicians
  set 
    rating = round(avg_rating, 2),
    total_jobs = job_count,
    updated_at = timezone('utc'::text, now())
  where id = new.technician_id;

  return new;
end;
$$ language plpgsql;

-- Create trigger to update technician rating when review is added
create trigger update_technician_rating_trigger
  after insert on public.reviews
  for each row execute procedure public.update_technician_rating();

-- Create function for emergency alert notifications
create or replace function public.notify_emergency_responders()
returns trigger as $$
begin
  -- Insert notifications for all available emergency responders
  insert into public.notifications (user_id, title, message, type, data)
  select 
    u.id,
    'Emergency Alert - ' || new.alert_type,
    'Emergency assistance needed at ' || coalesce(new.location_address, 'Unknown location'),
    'emergency',
    jsonb_build_object(
      'alert_id', new.id,
      'alert_type', new.alert_type,
      'location_lat', new.location_lat,
      'location_lng', new.location_lng,
      'user_id', new.user_id
    )
  from public.users u
  left join public.technicians t on t.id = u.id
  where 
    u.role in ('security', 'admin', 'super_admin')
    or (u.role = 'technician' and t.status = 'available');

  return new;
end;
$$ language plpgsql;

-- Create trigger for emergency alert notifications
create trigger notify_emergency_responders_trigger
  after insert on public.emergency_alerts
  for each row execute procedure public.notify_emergency_responders();

-- Create storage bucket for files
insert into storage.buckets (id, name, public) values ('files', 'files', true);

-- Grant usage on sequences to authenticated users
grant usage on all sequences in schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all routines in schema public to authenticated;

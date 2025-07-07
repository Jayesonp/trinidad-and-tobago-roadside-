-- Row Level Security Policies for RoadSide+ Trinidad & Tobago
-- Comprehensive security policies for all tables

-- Users table policies
create policy "Users can view own profile"
on public.users
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.users
for update
using (auth.uid() = id);

create policy "Admins can view all users"
on public.users
for select
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

create policy "Technicians can view customer profiles for assigned jobs"
on public.users
for select
to authenticated
using (
  exists (
    select 1 from public.service_requests sr
    join public.users u on u.id = auth.uid()
    where sr.user_id = users.id
    and sr.technician_id = auth.uid()
    and u.role = 'technician'
  )
);

-- Service requests policies
create policy "Users manage own requests"
on public.service_requests
for all
using (auth.uid() = user_id);

create policy "Technicians can view assigned requests"
on public.service_requests
for select
to authenticated
using (auth.uid() = technician_id);

create policy "Technicians can update assigned requests"
on public.service_requests
for update
to authenticated
using (
  auth.uid() = technician_id
  and exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'technician'
  )
);

create policy "Admins can view all requests"
on public.service_requests
for select
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

create policy "Emergency services can view emergency requests"
on public.service_requests
for select
to authenticated
using (
  emergency = true
  and exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('security', 'admin', 'super_admin')
  )
);

-- Technicians table policies
create policy "Technicians can manage own profile"
on public.technicians
for all
using (auth.uid() = id);

create policy "Users can view available technicians"
on public.technicians
for select
to authenticated
using (active = true and status = 'available');

create policy "Admins can manage all technicians"
on public.technicians
for all
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

-- Payments table policies
create policy "Users can view own payments"
on public.payments
for select
using (auth.uid() = user_id);

create policy "Users can create own payments"
on public.payments
for insert
with check (auth.uid() = user_id);

create policy "Admins can view all payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

create policy "System can update payment status"
on public.payments
for update
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

-- Locations table policies
create policy "Technicians can manage own location"
on public.locations
for all
using (
  auth.uid() = technician_id
  and exists (
    select 1 from public.users
    where id = auth.uid()
    and role = 'technician'
  )
);

create policy "Customers can view technician location for their requests"
on public.locations
for select
to authenticated
using (
  exists (
    select 1 from public.service_requests sr
    where sr.technician_id = locations.technician_id
    and sr.user_id = auth.uid()
    and sr.status in ('assigned', 'in_progress')
  )
);

create policy "Admins can view all locations"
on public.locations
for select
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

-- Notifications table policies
create policy "Users can manage own notifications"
on public.notifications
for all
using (auth.uid() = user_id);

create policy "Admins can create notifications for all users"
on public.notifications
for insert
to authenticated
with check (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

-- Reviews table policies
create policy "Users can view reviews for their requests"
on public.reviews
for select
to authenticated
using (
  auth.uid() = customer_id
  or auth.uid() = technician_id
);

create policy "Customers can create reviews for completed services"
on public.reviews
for insert
to authenticated
with check (
  auth.uid() = customer_id
  and exists (
    select 1 from public.service_requests sr
    where sr.id = service_request_id
    and sr.user_id = auth.uid()
    and sr.status = 'completed'
  )
);

create policy "Admins can view all reviews"
on public.reviews
for select
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

-- Emergency alerts table policies
create policy "Users can create own emergency alerts"
on public.emergency_alerts
for insert
with check (auth.uid() = user_id);

create policy "Users can view own emergency alerts"
on public.emergency_alerts
for select
using (auth.uid() = user_id);

create policy "Emergency responders can view all active alerts"
on public.emergency_alerts
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('security', 'admin', 'super_admin', 'technician')
  )
);

create policy "Emergency responders can update alerts"
on public.emergency_alerts
for update
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('security', 'admin', 'super_admin', 'technician')
  )
);

-- File uploads table policies
create policy "Users can manage own file uploads"
on public.file_uploads
for all
using (auth.uid() = user_id);

create policy "Technicians can view files for assigned requests"
on public.file_uploads
for select
to authenticated
using (
  exists (
    select 1 from public.service_requests sr
    join public.users u on u.id = auth.uid()
    where sr.id = file_uploads.service_request_id
    and sr.technician_id = auth.uid()
    and u.role = 'technician'
  )
);

create policy "Admins can view all file uploads"
on public.file_uploads
for select
to authenticated
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

-- Storage policies
create policy "user uploads own files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can view own files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can update own files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can delete own files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "technicians can view customer files for assigned jobs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'files'
  and exists (
    select 1 from public.service_requests sr
    join public.file_uploads fu on fu.service_request_id = sr.id
    where sr.technician_id = auth.uid()
    and fu.file_path = name
  )
);

create policy "admins can view all files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'files'
  and exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);

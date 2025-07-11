import { supabase } from './supabase';
import type {
  ServiceRequest,
  CreateServiceRequestData,
  UpdateServiceRequestData,
  NearbyTechnician,
  GetNearbyTechniciansParams,
  TTDFeeCalculation,
  CreatePaymentData,
  CreateReviewData,
  CreateEmergencyAlertData,
  UpdateTechnicianLocationData,
  ServiceRequestWithDetails,
  TechnicianWithUser,
  Service,
  User,
  Technician,
  Payment,
  Notification,
  EmergencyAlert
} from '../types/database';

// Service Requests
export async function createServiceRequest(data: CreateServiceRequestData): Promise<ServiceRequest> {
  const { data: request, error } = await supabase
    .from('service_requests')
    .insert([{ ...data, user_id: (await supabase.auth.getUser()).data.user?.id }])
    .select()
    .single();

  if (error) throw error;
  return request;
}

export async function getServiceRequest(id: string): Promise<ServiceRequestWithDetails> {
  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      user:users!service_requests_user_id_fkey(*),
      technician:users!service_requests_technician_id_fkey(*),
      service:services(*),
      payment:payments(*),
      reviews(*),
      file_uploads(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserServiceRequests(): Promise<ServiceRequest[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateServiceRequest(
  id: string, 
  updates: UpdateServiceRequestData
): Promise<ServiceRequest> {
  const { data, error } = await supabase
    .from('service_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Technicians
export async function getNearbyTechnicians(
  params: GetNearbyTechniciansParams
): Promise<NearbyTechnician[]> {
  const { data, error } = await supabase.rpc('get_nearby_technicians', params);
  if (error) throw error;
  return data;
}

export async function getTechnicianProfile(): Promise<TechnicianWithUser> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('technicians')
    .select(`
      *,
      user:users(*),
      organization:organizations(*)
    `)
    .eq('id', user.user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTechnicianLocation(
  data: UpdateTechnicianLocationData
): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // Update technician current location
  const { error: techError } = await supabase
    .from('technicians')
    .update({
      current_lat: data.latitude,
      current_lng: data.longitude,
    })
    .eq('id', user.user.id);

  if (techError) throw techError;

  // Insert location tracking record
  const { error: locError } = await supabase
    .from('locations')
    .insert([{
      technician_id: user.user.id,
      service_request_id: data.service_request_id,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      speed: data.speed,
      heading: data.heading,
    }]);

  if (locError) throw locError;
}

// Services
export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data;
}

export async function getService(id: string): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Payments
export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: payment, error } = await supabase
    .from('payments')
    .insert([{ ...data, user_id: user.user.id }])
    .select()
    .single();

  if (error) throw error;
  return payment;
}

export async function updatePaymentStatus(
  id: string,
  status: string,
  stripePaymentIntentId?: string
): Promise<Payment> {
  const updates: any = { status };
  if (stripePaymentIntentId) {
    updates.stripe_payment_intent_id = stripePaymentIntentId;
  }
  if (status === 'completed') {
    updates.processed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// TTD Fee Calculation
export async function calculateTTDFees(baseAmount: number): Promise<TTDFeeCalculation> {
  const { data, error } = await supabase.rpc('calculate_ttd_total', {
    base_amount: baseAmount
  });

  if (error) throw error;
  return data;
}

// Reviews
export async function createReview(data: CreateReviewData): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('reviews')
    .insert([{ ...data, customer_id: user.user.id }]);

  if (error) throw error;
}

export async function getTechnicianReviews(technicianId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:users!reviews_customer_id_fkey(full_name),
      service_request:service_requests(service_type, created_at)
    `)
    .eq('technician_id', technicianId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Emergency Alerts
export async function createEmergencyAlert(data: CreateEmergencyAlertData): Promise<EmergencyAlert> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data: alert, error } = await supabase
    .from('emergency_alerts')
    .insert([{ ...data, user_id: user.user.id }])
    .select()
    .single();

  if (error) throw error;
  return alert;
}

export async function getActiveEmergencyAlerts(): Promise<EmergencyAlert[]> {
  const { data, error } = await supabase
    .from('emergency_alerts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Notifications
export async function getUserNotifications(): Promise<Notification[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ 
      read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) throw error;
}

// User Profile
export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.user.id)
    .single();

  if (error) return null;
  return data;
}

// Real-time subscriptions
export function subscribeToServiceRequestUpdates(
  requestId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`service_request_${requestId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'service_requests',
        filter: `id=eq.${requestId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToTechnicianLocationUpdates(
  technicianId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`technician_location_${technicianId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'technicians',
        filter: `id=eq.${technicianId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToTechnicianLocationUpdates(
  technicianId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`technician_location_${technicianId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'locations',
        filter: `technician_id=eq.${technicianId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToUserNotifications(callback: (payload: any) => void) {
  return supabase
    .channel('user_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`,
      },
      callback
    )
    .subscribe();
}

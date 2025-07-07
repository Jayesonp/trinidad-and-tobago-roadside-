// Database types for RoadSide+ Trinidad & Tobago
// Generated from Supabase schema

export type UserRole = 'customer' | 'technician' | 'admin' | 'super_admin' | 'partner' | 'security';
export type ServiceType = 'towing' | 'battery' | 'tire' | 'lockout' | 'fuel' | 'mechanical' | 'accident';
export type RequestStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'emergency';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type TechnicianStatus = 'available' | 'busy' | 'offline' | 'emergency';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  push_token?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  license_number?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  description?: string;
  base_price_ttd: number;
  estimated_duration_minutes?: number;
  active: boolean;
  emergency_surcharge_percent: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  service_id: string;
  technician_id?: string;
  status: RequestStatus;
  service_type: ServiceType;
  location_lat: number;
  location_lng: number;
  location_address?: string;
  description?: string;
  emergency: boolean;
  estimated_price_ttd?: number;
  final_price_ttd?: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  customer_rating?: number;
  customer_feedback?: string;
  technician_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: string;
  license_number?: string;
  specializations?: ServiceType[];
  status: TechnicianStatus;
  current_lat?: number;
  current_lng?: number;
  vehicle_info?: {
    make?: string;
    model?: string;
    year?: number;
    plate?: string;
    color?: string;
  };
  rating: number;
  total_jobs: number;
  active: boolean;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  service_request_id: string;
  user_id: string;
  stripe_payment_intent_id?: string;
  amount_ttd: number;
  platform_fee_ttd: number;
  processing_fee_ttd: number;
  vat_ttd: number;
  total_amount_ttd: number;
  status: PaymentStatus;
  payment_method?: string;
  processed_at?: string;
  refunded_at?: string;
  refund_amount_ttd?: number;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  technician_id: string;
  service_request_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  service_request_id: string;
  customer_id: string;
  technician_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  service_request_id?: string;
  alert_type: string;
  location_lat: number;
  location_lng: number;
  location_address?: string;
  description?: string;
  status: string;
  responded_by?: string;
  responded_at?: string;
  resolved_at?: string;
  created_at: string;
}

export interface FileUpload {
  id: string;
  user_id: string;
  service_request_id?: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  upload_type: string;
  public_url?: string;
  created_at: string;
}

// API Response types
export interface TTDFeeCalculation {
  base_amount: number;
  platform_fee: number;
  processing_fee: number;
  vat: number;
  total_amount: number;
}

export interface NearbyTechnician {
  technician_id: string;
  full_name?: string;
  phone?: string;
  rating: number;
  distance_km: number;
  current_lat?: number;
  current_lng?: number;
  specializations?: ServiceType[];
}

// Database function parameters
export interface GetNearbyTechniciansParams {
  user_lat: number;
  user_lng: number;
  service_type_param: ServiceType;
  radius_km?: number;
}

// Extended types with relations
export interface ServiceRequestWithDetails extends ServiceRequest {
  user?: User;
  technician?: User;
  service?: Service;
  payment?: Payment;
  reviews?: Review[];
  file_uploads?: FileUpload[];
}

export interface TechnicianWithUser extends Technician {
  user?: User;
  organization?: Organization;
}

export interface PaymentWithRequest extends Payment {
  service_request?: ServiceRequest;
  user?: User;
}

// Form types
export interface CreateServiceRequestData {
  service_id: string;
  service_type: ServiceType;
  location_lat: number;
  location_lng: number;
  location_address?: string;
  description?: string;
  emergency?: boolean;
  scheduled_at?: string;
}

export interface UpdateServiceRequestData {
  status?: RequestStatus;
  technician_id?: string;
  estimated_price_ttd?: number;
  final_price_ttd?: number;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  technician_notes?: string;
}

export interface CreatePaymentData {
  service_request_id: string;
  amount_ttd: number;
  platform_fee_ttd: number;
  processing_fee_ttd: number;
  vat_ttd: number;
  total_amount_ttd: number;
  payment_method?: string;
  stripe_payment_intent_id?: string;
}

export interface CreateReviewData {
  service_request_id: string;
  technician_id: string;
  rating: number;
  comment?: string;
}

export interface CreateEmergencyAlertData {
  alert_type: string;
  location_lat: number;
  location_lng: number;
  location_address?: string;
  description?: string;
  service_request_id?: string;
}

export interface UpdateTechnicianLocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  service_request_id?: string;
}

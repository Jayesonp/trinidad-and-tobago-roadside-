# RoadSide+ API Documentation

## Base URL
- **Production**: `https://api.roadsideplus.tt`
- **Staging**: `https://staging-api.roadsideplus.tt`
- **Development**: `http://localhost:3001`

## Authentication

All API requests require authentication using JWT tokens in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "profile": {...}
    }
  }
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1868xxxxxxx",
  "role": "customer"
}
```

#### POST /auth/refresh
Refresh an expired JWT token.

#### POST /auth/logout
Logout and invalidate the current token.

## Service Management

#### GET /services
Get all available services.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Towing Service",
      "description": "Vehicle towing to nearest service center",
      "basePrice": 150,
      "estimatedDuration": 45,
      "category": "emergency",
      "icon": "🚛"
    }
  ]
}
```

#### POST /service-requests
Create a new service request.

**Request Body:**
```json
{
  "serviceId": "uuid",
  "location": {
    "latitude": 10.6918,
    "longitude": -61.2225,
    "address": "Queen's Park Savannah, Port of Spain"
  },
  "description": "Car won't start, need battery jump",
  "urgency": "high",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2018,
    "color": "Blue",
    "licensePlate": "ABC-1234"
  }
}
```

#### GET /service-requests/:id
Get details of a specific service request.

#### PATCH /service-requests/:id/status
Update service request status (technician only).

**Request Body:**
```json
{
  "status": "accepted|in_progress|completed|cancelled",
  "notes": "Optional status update notes"
}
```

## Real-time Tracking

#### GET /tracking/:requestId
Get real-time tracking information for a service request.

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "uuid",
    "technicianLocation": {
      "latitude": 10.6918,
      "longitude": -61.2225,
      "lastUpdated": "2025-07-07T18:30:00Z"
    },
    "estimatedArrival": "2025-07-07T19:00:00Z",
    "status": "en_route"
  }
}
```

## Payment Processing

#### POST /payments/intent
Create a payment intent for a service.

**Request Body:**
```json
{
  "serviceRequestId": "uuid",
  "amount": 15000,
  "currency": "TTD",
  "paymentMethod": "card"
}
```

#### POST /payments/confirm
Confirm a payment.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

## User Management (Admin Only)

#### GET /admin/users
Get all users with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `role`: Filter by user role
- `status`: Filter by user status

#### POST /admin/users
Create a new user account.

#### PATCH /admin/users/:id
Update user information.

#### DELETE /admin/users/:id
Deactivate a user account.

## Analytics & Reporting

#### GET /analytics/dashboard
Get dashboard analytics data.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 15420,
    "activeRequests": 87,
    "monthlyRevenue": 245000,
    "averageResponseTime": 28,
    "customerSatisfaction": 4.6
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per minute per IP
- **Real-time tracking**: 60 requests per minute per user

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.roadsideplus.tt', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events
- `location_update`: Real-time location updates
- `status_change`: Service request status changes
- `new_message`: Chat messages
- `emergency_alert`: Emergency notifications

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @roadsideplus/api-client
```

### Usage Example
```javascript
import { RoadSidePlusAPI } from '@roadsideplus/api-client';

const api = new RoadSidePlusAPI({
  baseURL: 'https://api.roadsideplus.tt',
  apiKey: 'your-api-key'
});

const services = await api.services.getAll();
```

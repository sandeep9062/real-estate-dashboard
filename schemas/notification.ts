export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'booking' | 'property' | 'payment' | 'user' | 'system';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    bookingId?: string;
    propertyId?: string;
    userId?: string;
    paymentId?: string;
    [key: string]: any;
  };
  actionUrl?: string;
}

export type NotificationType = 'booking_request' | 'property_inquiry' | 'payment_received' | 'new_user' | 'property_approved' | 'system_alert';

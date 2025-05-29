import { jwtDecode } from 'jwt-decode';

interface Notification {
    id: string;
    title: string;
    content: string;
    type: string;
    is_read: boolean;
    created_at: string;
    target_entity_id: string;
}

interface NotificationResponse {
    status_code: number;
    payload: Notification[];
    meta_data: {
        total_items_count: number;
        page_size: number;
        total_pages_count: number;
        page_index: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

interface JwtPayload {
    id: string;
}

const API_BASE_URL = 'https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api';

export class NotificationService {
    private static getCustomerId(): string | null {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            return decoded.id;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    static async getNotifications(pageIndex: number = 0, pageSize: number = 10): Promise<NotificationResponse> {
        const customerId = this.getCustomerId();
        if (!customerId) {
            throw new Error('No customer ID found');
        }

        const token = localStorage.getItem('accessToken');
        const response = await fetch(
            `${API_BASE_URL}/customers/${customerId}/notifications?pageIndex=${pageIndex}&pageSize=${pageSize}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        return response.json();
    }

    static async markAsRead(notificationId: string): Promise<void> {
        const customerId = this.getCustomerId();
        if (!customerId) {
            throw new Error('No customer ID found');
        }

        const token = localStorage.getItem('accessToken');
        const response = await fetch(
            `${API_BASE_URL}/customers/${customerId}/notifications/${notificationId}/read`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }
    }
} 
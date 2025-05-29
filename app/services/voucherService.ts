import axios from 'axios';

const API_URL = 'https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api';

export const voucherService = {
    async getVouchers(bakeryId: string, accessToken: string) {
        try {
            const response = await axios.get(`${API_URL}/vouchers`, {
                params: {
                    bakeryId,
                    pageIndex: 0,
                    pageSize: 10
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            throw error;
        }
    }
}; 
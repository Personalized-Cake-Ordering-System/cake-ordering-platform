
const API_BASE_URL = 'https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/orders';

export const createOrder = async (orderData: any) => {
    const accessToken = localStorage.getItem('accessToken'); // Retrieve the access token

    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Include the token in the headers
        },
        body: JSON.stringify(orderData),
    });
    return response.json();
};

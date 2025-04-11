// import { useEffect, useState } from 'react';
// import * as signalR from '@microsoft/signalr';
// import { toast } from 'sonner';

// interface SignalRNotificationComponentProps {
//     userId: string;
//     onPaymentSuccess?: (orderCode: string) => void;
// }

// const SignalRNotificationComponent: React.FC<SignalRNotificationComponentProps> = ({ userId, onPaymentSuccess }) => {
//     const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

//     useEffect(() => {
//         const newConnection = new signalR.HubConnectionBuilder()
//             .withUrl(
//                 `https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/signalR-hub?userId=${userId}`,
//                 { withCredentials: false }
//             )
//             .configureLogging(signalR.LogLevel.Information)
//             .build();

//         newConnection
//             .start()
//             .then(() => {
//                 console.log('SignalR Connected!');
//             })
//             .catch((err) => console.error('Error while starting connection: ' + err));

//         // Listen for payment success notification
//         newConnection.on('PaymentSuccess', (orderCode: string) => {
//             console.log('Payment success notification received for order:', orderCode);
//             toast.success('Payment successful! Redirecting...');
//             if (onPaymentSuccess) {
//                 onPaymentSuccess(orderCode);
//             }
//         });

//         // Listen for QR code scanned notification
//         newConnection.on('QRCodeScanned', (message: string) => {
//             console.log('QR code scanned notification:', message);
//             toast.info(message);
//         });

//         setConnection(newConnection);

//         return () => {
//             newConnection.stop().catch((err) => console.error('Error stopping connection: ' + err));
//         };
//     }, [userId, onPaymentSuccess]);

//     return null; // This component doesn't render anything visible
// };

// export default SignalRNotificationComponent;



// "use client";

// import { createContext, useContext, useState, useEffect } from "react";
// import * as signalR from "@microsoft/signalr";
// import { toast } from "sonner";

// interface SignalRContextType {
//     message: any;
//     connection: signalR.HubConnection | null;
// }

// const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

// const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
//     const [message, setMessage] = useState<any>(null);
//     const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

//     useEffect(() => {
//         const newConnection = new signalR.HubConnectionBuilder()
//             .withUrl("https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/signalR-hub", {
//                 withCredentials: false
//             })
//             .withAutomaticReconnect()
//             .build();

//         newConnection
//             .start()
//             .then(() => {
//                 console.log("SignalR Connected!");

//                 // Listen for QR code scanned notification
//                 newConnection.on("QRCodeScanned", (message: string) => {
//                     console.log("QR code scanned:", message);
//                     toast.info(message);
//                     setMessage(message);
//                 });

//                 // Listen for payment success notification
//                 newConnection.on("PaymentSuccess", (orderCode: string) => {
//                     console.log("Payment success for order:", orderCode);
//                     toast.success("Payment successful!");
//                     setMessage({ type: "paymentSuccess", orderCode });
//                 });
//             })
//             .catch((error) => {
//                 console.error("Connection error:", error);
//                 toast.error("Failed to connect to payment service");
//             });

//         setConnection(newConnection);

//         return () => {
//             newConnection.stop().catch((err) => console.error("Error stopping connection:", err));
//         };
//     }, []);

//     return (
//         <SignalRContext.Provider value={{ message, connection }}>
//             {children}
//         </SignalRContext.Provider>
//     );
// };

// export default SignalRProvider;

// export const useSignalR = () => {
//     const context = useContext(SignalRContext);
//     if (context === undefined) {
//         throw new Error("useSignalR must be used within a SignalRProvider");
//     }
//     return context;
// };

"use client";

import { createContext, useContext, useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "@/contexts/AuthContext";
import { getNotificationMessage } from "@/lib/notification-utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignalRContext = createContext<any | undefined>(undefined);

const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();

  const [message, setMessage] = useState(null);

  useEffect(() => {
    const tokenPayload = token ? JSON.parse(atob(token.split(".")[1])) : null;

    if (!tokenPayload) {
      return;
    }
    const customerId = tokenPayload.id;
    console.log("customerId", customerId);
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/signalR-hub", { withCredentials: false })
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(async () => {
        //Check with current userId
        newConnection.on("messageReceived", (userId, message) => {
          if (customerId === userId) {
            const data = JSON.parse(message);
            const notificationMessage = getNotificationMessage(data.Type);
            toast.success(notificationMessage);
            setMessage(data);
          }
        });
      })
      .catch((error) => console.error("Connection error:", error));
  }, [URL, token]);

  return (
    <SignalRContext.Provider value={{ message }}>
      <ToastContainer />
      {children}
    </SignalRContext.Provider>
  );
};

export default SignalRProvider;

export const useSignalR = () => {
  return useContext(SignalRContext);
};

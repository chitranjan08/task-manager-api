import { useEffect } from "react";
import axios from "../axios";

const PUBLIC_KEY = "BNsHuQVVJCmEy7aNy-oAwle4IO8vA8vFCGC1G-mZJLUh9ULT09bh9pmbw9-18WOeYTPP0wxZvQm2DlHz5axh_o8"; // from .env

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function usePushNotification(userId) {
  useEffect(() => {
    console.log("🔔 usePushNotification hook called with userId:", userId); // Debug log
    
    if (!userId) {
      console.log("⛔ No userId provided, skipping notification setup"); // Debug log
      return;
    }

    if (!("serviceWorker" in navigator)) {
      console.log("❌ Service Worker not supported"); // Debug log
      return;
    }

    if (!("PushManager" in window)) {
      console.log("❌ Push Manager not supported"); // Debug log
      return;
    }

    console.log("✅ Starting push notification setup..."); // Debug log

    navigator.serviceWorker
      .register("/sw.js")
      .then((swReg) => {
        console.log("✅ Service Worker registered:", swReg); // Debug log
        return Notification.requestPermission().then((permission) => {
          console.log("🔔 Notification permission:", permission); // Debug log
          if (permission !== "granted") {
            console.log("❌ Notification permission denied"); // Debug log
            return null;
          }
          return swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
          });
        });
      })
      .then((subscription) => {
        if (subscription) {
          console.log("✅ Push subscription created:", subscription); // Debug log
          return axios.post("/notifications/subscribe", {
            userId,
            subscription,
          });
        } else {
          console.log("❌ No subscription created"); // Debug log
        }
      })
      .then((response) => {
        if (response) {
          console.log("✅ Subscription saved to backend:", response.data); // Debug log
        }
      })
      .catch((err) => {
        console.error("❌ Push setup failed:", err);
      });
  }, [userId]);
}

export default usePushNotification;


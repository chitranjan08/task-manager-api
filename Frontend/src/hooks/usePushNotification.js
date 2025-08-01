import { useEffect } from "react";
import axios from "../axios";

const PUBLIC_KEY = "BNsHuQVVJCmEy7aNy-oAwle4IO8vA8vFCGC1G-mZJLUh9ULT09bh9pmbw9-18WOeYTPP0wxZvQm2DlHz5axh_o8";

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
    if (!userId) {
      console.log("No userId provided");
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push not supported");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((swReg) => {
        return Notification.requestPermission().then((permission) => {
          if (permission !== "granted") {
            // ⛔ User denied, remove from backend
            return axios.post("/notifications/subscribe", {
              userId,
              permission: "denied",
            });
          }

          // ✅ User granted permission
          return swReg.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
            })
            .then((subscription) => {
              return axios.post("/notifications/subscribe", {
                userId,
                subscription,
                permission: "granted",
              });
            });
        });
      })
      .then((res) => {
        if (res?.data?.message) {
          console.log("🔔 Notification response:", res.data.message);
        }
      })
      .catch((err) => {
        console.error("Push Notification Setup Error:", err);
      });
  }, [userId]);
}

export default usePushNotification;

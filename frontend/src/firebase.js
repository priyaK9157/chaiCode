import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Initialize Firebase
// Note: Replace these values with your actual Firebase Config keys from the Firebase console!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request notification permissions and register token with backend
export const requestForToken = async (apiBaseUrl, jwtToken) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("🔔 Notification permission granted.");
      
      // Get FCM token
      // Note: Replace YOUR_VAPID_PUBLIC_KEY with your Web Push certificate key from Firebase Dashboard:
      // Project Settings -> Cloud Messaging -> Web Push certificates -> Key pair
      const currentToken = await getToken(messaging, {
        vapidKey: "BPdsXDoM_cEQP7f7q20OjcFQQwLrGUxgW9L5a7ouQbCxVDB1bM6DJZ3KABTejOFWcZSlQ3N8WLmZ9t4dHfuDKKg" 
      });

      if (currentToken) {
        console.log("FCM Token:", currentToken);
        
        // Sync token to course-service backend via api-gateway
        const response = await fetch(`${apiBaseUrl}/api/courses/push/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`
          },
          body: JSON.stringify({ token: currentToken })
        });
        
        if (response.ok) {
          console.log("📡 FCM token successfully synced to backend database.");
        } else {
          console.error("❌ Failed to sync FCM token with backend.");
        }
      } else {
        console.log("⚠️ No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("❌ Notification permission denied.");
    }
  } catch (err) {
    console.error("❌ An error occurred while retrieving token:", err);
  }
};

// Listen to foreground notifications
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

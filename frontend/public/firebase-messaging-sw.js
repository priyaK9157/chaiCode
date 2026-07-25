// Import and configure the Firebase SDK inside the service worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: Replace these values with your actual Firebase Config keys from the Firebase console!
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };


const firebaseConfig = {
  apiKey: "AIzaSyDA2vbJkblmtW4282pP4dmPpQfIlUBH1RQ",
  authDomain: "chaicode-c2b80.firebaseapp.com",
  projectId: "chaicode-c2b80",
  storageBucket: "chaicode-c2b80.firebasestorage.app",
  messagingSenderId: "495850796609",
  appId: "1:495850796609:web:a7604f572253cdc32cf8c0",
  measurementId: "G-HVB5SXS45G"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

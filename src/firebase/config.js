import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// initialize firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Dev-only bypass for testing without a real Google account or touching
// real data: sign-in still goes through the same
// signInWithPopup(auth, provider) call in NotLoggedIn.js, but against the
// local Firebase Auth Emulator (a fake IDP screen, no real OAuth); Firestore
// reads/writes go to the local Firestore Emulator too, since production
// Firestore's security rules reject the emulator's unsigned auth tokens
// anyway. Fully isolated fake data — inert unless explicitly opted into
// locally (`firebase emulators:start --only auth,firestore` +
// REACT_APP_USE_AUTH_EMULATOR=true).
if (process.env.REACT_APP_USE_AUTH_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
}

export { auth, provider, db, storage };

// src/firebase/firebaseConfig.jsx
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();


// Function to upload profile picture (no changes needed here)
export const uploadProfilePicture = async (file, userId) => {
  try {
    // Create a reference to the file location
    const storageRef = ref(storage, `profilePictures/${userId}`);
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// Modified signInWithGoogle function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user data already exists
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // Create a new document for the user in Firestore
      await setDoc(userRef, {
        userId: user.uid, // Good: Store UID as a field (optional, but helpful)
        displayName: user.displayName,
        email: user.email, // Good: Store email
        photoURL: user.photoURL,
        // Initialize other fields with default values
        bio: "",
        socialMedia: {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: "",
        },
        emergencyContacts: [],
        preferences: {
          travelStyle: "",
          accommodationType: "",
          interests: [],
          dietaryRestrictions: "",
          accessibilityNeeds: "",
        },
        passportDetails: {
          passportNumber: "",
          expiryDate: "",
          nationality: "",
        },
        preferredLanguage: "",
      });
      console.log("New user document created in Firestore.");
    } else {
      console.log("User document already exists.");
    }

    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error; // Re-throw the error for handling in the component
  }
};

export const logout = async () => {
  await signOut(auth);
};

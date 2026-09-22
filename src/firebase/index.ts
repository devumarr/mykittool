"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getDatabase, Database } from "firebase/database";
import { firebaseConfig } from "./config";
import {
  getAuth,
  Auth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;
let rtdb: Database | undefined;

// Only startif we have a potentially valid API key
if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    storage = getStorage(app);
    rtdb = getDatabase(app);
  } catch (err) {
    console.error("Firebase services failed to initialize:", err);
  }
} else {
  console.warn(
    "Firebase API Key is missing or invalid. Authentication and Cloud features will be restricted.",
  );
}

export { app, db, auth, storage, rtdb };

export function initializeFirebase() {
  return {
    firebaseApp: app || null,
    firestore: db || null,
    auth: auth || null,
    storage: storage || null,
    rtdb: rtdb || null,
  };
}

export * from "./provider";
export * from "./auth/use-user";
export * from "./firestore/use-collection";
export * from "./firestore/use-doc";

/**
 * Caribbe Legal Services - Firebase Backend Integration Architecture (v1.0)
 * Handles Cloud Firestore Database, Authentication, and Local Storage Sync.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase Configuration Object (Replace with your Firebase Console Web App Config)
const firebaseConfig = {
  apiKey: "AIzaSyCaribbeLegalServicesOfficialConfigPlaceholderKey",
  authDomain: "caribbe-legal-services-app.firebaseapp.com",
  projectId: "caribbe-legal-services-app",
  storageBucket: "caribbe-legal-services-app.appspot.com",
  messagingSenderId: "4804799891",
  appId: "1:4804799891:web:caribbelegalservicesapp"
};

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * 1. Guardar Solicitud de Pasaporte en Cloud Firestore
 */
export async function savePassportApplicationToFirebase(passportData) {
  try {
    const payload = {
      ...passportData,
      estadoTramite: 'En Revisión Notarial',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add document to 'caribbe_solicitudes_pasaporte' collection
    const docRef = await addDoc(collection(db, "caribbe_solicitudes_pasaporte"), payload);
    console.log("✅ Solicitud guardada con éxito en Firestore con ID:", docRef.id);
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.warn("⚠️ Firebase sin conexión activa aún. Guardado localmente en respaldo:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Guardar Cita Agendada en Cloud Firestore
 */
export async function saveAppointmentToFirebase(appointmentData) {
  try {
    const payload = {
      ...appointmentData,
      estadoCita: 'Confirmada',
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "caribbe_citas_agendadas"), payload);
    console.log("✅ Cita agendada guardada en Firestore con ID:", docRef.id);
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.warn("⚠️ Guardando cita en almacenamiento de respaldo:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Consultar Expediente de Pasaporte por Código Notarial (CLS-2026-XXXXXX)
 */
export async function getPassportStatusByCode(refNumber) {
  try {
    const q = query(
      collection(db, "caribbe_solicitudes_pasaporte"), 
      where("refNumber", "==", refNumber)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();
      return { found: true, data: docData };
    }
    return { found: false };
  } catch (error) {
    console.error("Error consultando expedientes en Firestore:", error);
    return { found: false, error: error.message };
  }
}

/**
 * 4. Obtener Todas las Solicitudes (Para el Panel de Administración)
 */
export async function getAllPassportApplications() {
  try {
    const q = query(collection(db, "caribbe_solicitudes_pasaporte"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    console.error("Error obteniendo expedientes para el Admin Panel:", error);
    return [];
  }
}

/**
 * 5. Iniciar Sesión de Notarias (Lic. Alianet & Lic. Yeisy)
 */
export async function loginAdminNotary(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Global Export
window.CaribbeFirebase = {
  db,
  auth,
  savePassport: savePassportApplicationToFirebase,
  saveAppointment: saveAppointmentToFirebase,
  getStatus: getPassportStatusByCode,
  getAll: getAllPassportApplications,
  login: loginAdminNotary
};

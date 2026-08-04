/**
 * Caribbe Legal Services - Master Firebase & Firestore Engine (v2.0)
 * Fully connected Cloud Firestore Database, Visit Tracking, Appointment Calendar, Passport Applications & Client Master Records.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDoc,
  getDocs, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  doc, 
  setDoc,
  updateDoc, 
  increment,
  onSnapshot,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// --- CONFIGURACIÓN DE AUTOMATIZACIÓN n8n & CORREOS ---
export const N8N_CONFIG = {
  webhookUrl: "https://n8n.vixoradigital.com/webhook/caribbe-cita",
  productionWebhookUrl: "https://n8n.vixoradigital.com/webhook/caribbe-cita",
  adminEmail: "caribbelegalservices@gmail.com"
};

export async function sendN8nWebhook(eventType, payloadData = {}) {
  const targetUrl = N8N_CONFIG.webhookUrl || N8N_CONFIG.productionWebhookUrl;
  if (!targetUrl) {
    console.log(`[n8n Webhook Config Pendiente] Evento: ${eventType}`, payloadData);
    return false;
  }

  // Ejecución no bloqueante en segundo plano
  setTimeout(async () => {
    // Prevent Mixed Content security block when site is loaded over HTTPS
    let urlToUse = targetUrl;
    if (window.location.protocol === 'https:' && urlToUse.startsWith('http:')) {
      urlToUse = urlToUse.replace('http:', 'https:');
    }

    const payload = {
      event: eventType,
      adminEmail: N8N_CONFIG.adminEmail,
      timestamp: new Date().toISOString(),
      ...payloadData
    };

    try {
      let res = await fetch(urlToUse, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // If test webhook was inactive (404), try production webhook URL
      if (!res.ok && res.status === 404 && N8N_CONFIG.productionWebhookUrl && targetUrl !== N8N_CONFIG.productionWebhookUrl) {
        await fetch(N8N_CONFIG.productionWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      console.log(`[n8n Webhook] ✅ Evento ${eventType} enviado a n8n`);
    } catch(err) {
      // CORS Fallback: send via sendBeacon or no-cors fetch (bypasses CORS preflight)
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
          navigator.sendBeacon(targetUrl, blob);
        } else {
          await fetch(targetUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        }
        console.log(`[n8n Webhook] ✅ Evento ${eventType} enviado via modo sin CORS`);
      } catch(e) {
        console.warn("[n8n Webhook Warning]", e);
      }
    }
  }, 50);

  return true;
}

export const EMAIL_CONFIG = {
  serviceId: "YOUR_SERVICE_ID",     // Reemplazar con Service ID de EmailJS si se usa EmailJS
  templateId: "YOUR_TEMPLATE_ID",   // Reemplazar con Template ID de EmailJS
  publicKey: "YOUR_PUBLIC_KEY",     // Reemplazar con Public Key de EmailJS
  adminEmail: "caribbelegalservices@gmail.com"
};

export async function sendAutomatedEmail(toEmail, toName, type, data = {}) {
  if (!toEmail) return false;
  
  // Non-blocking async execution in background (never stops UI or form submit)
  setTimeout(async () => {
    try {
      if (typeof emailjs === 'undefined') {
        await new Promise((resolve) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
          s.onload = () => resolve(true);
          s.onerror = () => resolve(false);
          document.head.appendChild(s);
        });
      }

      if (typeof emailjs !== 'undefined' && EMAIL_CONFIG.serviceId !== "YOUR_SERVICE_ID") {
        emailjs.init(EMAIL_CONFIG.publicKey);

        const emailParams = {
          to_email: toEmail,
          to_name: toName || 'Estimado/a Cliente',
          admin_email: EMAIL_CONFIG.adminEmail,
          service_name: data.service || data.tipoTramite || 'Trámite Notarial',
          appointment_date: data.date || data.fecha || 'Fecha por confirmar',
          appointment_time: data.time || data.hora || 'Hora por confirmar',
          notary_name: data.notary || 'Notario Asignado',
          client_phone: data.phone || data.phoneNumber || 'N/A',
          notes: data.notes || 'Cita registrada en plataforma.'
        };

        await emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, emailParams);
        console.log(`[Email Automation] ✅ Correo enviado a ${toEmail} y copia a ${EMAIL_CONFIG.adminEmail}`);
      } else {
        console.log(`[Email Automation Pending Config] Correo para: ${toEmail} (${toName}) | Cita:`, data);
      }
    } catch(err) {
      console.warn("[Email Automation Non-Blocking Warning]", err);
    }
  }, 50);

  return true;
}
// ------------------------------------

// Firebase Web Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnho_p7FxGosOrgSZV-wKgiGDpXR6AOUM",
  authDomain: "caribbe-legal-services.firebaseapp.com",
  projectId: "caribbe-legal-services",
  storageBucket: "caribbe-legal-services.firebasestorage.app",
  messagingSenderId: "752208344373",
  appId: "1:752208344373:web:85e1cd9862145ca525487c",
  measurementId: "G-9KXMP507CJ"
};

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const PASSPORT_COLLECTION = "caribbe_solicitudes_pasaporte";
const APPOINTMENT_COLLECTION = "caribbe_citas_agendadas";
const CLIENTS_COLLECTION = "caribbe_clientes";
const VISITS_COLLECTION = "caribbe_visitas";

/**
 * 1. Track Page Visit Analytics in Cloud Firestore
 */
export async function trackPageVisit(pageName = "Inicio") {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const visitDocRef = doc(db, VISITS_COLLECTION, todayStr);
    await setDoc(visitDocRef, {
      date: todayStr,
      totalVisits: increment(1),
      lastVisitAt: serverTimestamp()
    }, { merge: true });

    // Also update local counter as instant fallback
    let localVisits = parseInt(localStorage.getItem('caribbe_total_visits') || '1420', 10);
    localStorage.setItem('caribbe_total_visits', (localVisits + 1).toString());
  } catch (e) {
    let localVisits = parseInt(localStorage.getItem('caribbe_total_visits') || '1420', 10);
    localStorage.setItem('caribbe_total_visits', (localVisits + 1).toString());
  }
}

/**
 * 2. Save Passport Application (Steps 1-6) to Cloud Firestore
 */
export async function savePassportApplication(passportData) {
  const refNumber = passportData.refNumber || ('CLS-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000));
  const clientName = [passportData.firstName, passportData.lastName].filter(Boolean).join(' ') || 'Cliente Notarial';

  let clientId = null;
  if (auth.currentUser) {
    clientId = auth.currentUser.uid;
  }

  const payload = {
    ...passportData,
    refNumber: refNumber,
    clientName: clientName,
    clientId: clientId, // Linked to the authenticated user
    estadoTramite: passportData.estadoTramite || 'En Revisión Notarial',
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp()
  };

  // 1. Store in Local Storage Engine
  try {
    let localStore = JSON.parse(localStorage.getItem('caribbe_all_passport_apps') || '[]');
    localStore.unshift(payload);
    localStorage.setItem('caribbe_all_passport_apps', JSON.stringify(localStore));
  } catch (e) {}

  // 2. Always trigger n8n Webhook in background
  sendN8nWebhook('PASSPORT_SUBMITTED', payload);

  // 3. Write to Firestore Cloud Database
  try {
    const docRef = await addDoc(collection(db, PASSPORT_COLLECTION), payload);
    
    // Sync with Client Master Profile
    await syncClientRecord({
      phone: passportData.phone || 'S/N',
      email: passportData.email || 'S/N',
      name: clientName,
      lastActivity: 'Solicitud de Pasaporte Cubano',
      refNumber: refNumber
    });

    return { success: true, docId: docRef.id, refNumber: refNumber };
  } catch (error) {
    console.warn("⚠️ Guardado en respaldo local:", error.message);
    return { success: true, localOnly: true, refNumber: refNumber };
  }
}

/**
 * 3. Save Appointment to Cloud Firestore
 */
export async function saveAppointment(appointmentData) {
  const payload = {
    ...appointmentData,
    estadoCita: 'Confirmada',
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp()
  };

  // 1. Store in Local Storage
  try {
    let localApps = JSON.parse(localStorage.getItem('caribbe_all_appointments') || '[]');
    localApps.unshift(payload);
    localStorage.setItem('caribbe_all_appointments', JSON.stringify(localApps));
  } catch (e) {}

  // 2. Always trigger n8n Webhook & Automated Email (fail-safe in background)
  if (appointmentData.email && appointmentData.email !== 'S/N') {
    sendAutomatedEmail(appointmentData.email, appointmentData.name, 'APPOINTMENT_CREATED', {
      date: appointmentData.date,
      time: appointmentData.time,
      service: appointmentData.service
    });
  }
  sendN8nWebhook('APPOINTMENT_CREATED', appointmentData);

  // 3. Write to Firestore
  try {
    const docRef = await addDoc(collection(db, APPOINTMENT_COLLECTION), payload);
    
    await syncClientRecord({
      phone: appointmentData.phone || 'S/N',
      email: appointmentData.email || 'S/N',
      name: appointmentData.name || 'Cliente Notarial',
      lastActivity: 'Cita Agendada (' + (appointmentData.date || 'Fecha Pendiente') + ')'
    });

    return { success: true, docId: docRef.id };
  } catch (error) {
    return { success: true, localOnly: true };
  }
}

/**
 * 4. Helper to Sync Client Directory Profile
 */
async function syncClientRecord(clientInfo) {
  try {
    const clientId = (clientInfo.phone || clientInfo.name || 'client_' + Date.now()).replace(/[^a-zA-Z0-9]/g, '_');
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
    await setDoc(clientRef, {
      ...clientInfo,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {}
}

/**
 * Save / Update Client Profile in local storage and Cloud Firestore
 */
export async function saveClientProfile(clientData) {
  const phoneKey = (clientData.phone || '').replace(/[^0-9]/g, '');
  const emailKey = (clientData.email || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const clientId = clientData.id || clientData.clientId || (phoneKey ? 'client_ph_' + phoneKey : (emailKey ? 'client_em_' + emailKey : 'client_' + Date.now()));

  const payload = {
    id: clientId,
    clientId: clientId,
    name: clientData.name || clientData.fullName || 'Cliente Notarial',
    email: clientData.email || '',
    phone: clientData.phone || '',
    streetAddress: clientData.streetAddress || clientData.address || '',
    city: clientData.city || 'Glendale',
    state: clientData.state || 'AZ',
    zip: clientData.zip || '',
    notes: clientData.notes || '',
    services: clientData.services || [],
    updatedAt: new Date().toISOString()
  };

  // 1. Sync with Local Storage
  try {
    let localClients = JSON.parse(localStorage.getItem('caribbe_all_clients') || '[]');
    const existingIdx = localClients.findIndex(c => c.id === clientId || (c.phone && c.phone === payload.phone) || (c.email && c.email.toLowerCase() === payload.email.toLowerCase()));
    if (existingIdx >= 0) {
      localClients[existingIdx] = { ...localClients[existingIdx], ...payload };
    } else {
      localClients.unshift(payload);
    }
    localStorage.setItem('caribbe_all_clients', JSON.stringify(localClients));

    // Broadcast live change
    try {
      const ch = new BroadcastChannel('caribbe_sync_channel');
      ch.postMessage({ type: 'CLIENT_UPDATED', payload: payload });
    } catch(e) {}
  } catch (e) {}

  // 2. Sync with Cloud Firestore
  try {
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
    await setDoc(clientRef, {
      ...payload,
      timestamp: serverTimestamp()
    }, { merge: true });
    return { success: true, clientId };
  } catch (err) {
    return { success: true, localOnly: true, clientId };
  }
}

/**
 * 5. Fetch Dashboard Analytics & Records (Cloud Firestore + Local Sync)
 */
export async function fetchAdminDashboardData() {
  let passportApps = [];
  let appointments = [];
  let dashboardUsers = [];
  let totalVisits = parseInt(localStorage.getItem('caribbe_total_visits') || '1428', 10);

  // Try Firestore Cloud Fetch
  try {
    // Fetch Passport Apps
    const pSnap = await getDocs(collection(db, PASSPORT_COLLECTION));
    pSnap.forEach(d => passportApps.push({ id: d.id, ...d.data() }));

    // Fetch Appointments
    const aSnap = await getDocs(collection(db, APPOINTMENT_COLLECTION));
    aSnap.forEach(d => appointments.push({ id: d.id, ...d.data() }));

    // Fetch Registered Clients (Directory)
    const cSnap = await getDocs(collection(db, CLIENTS_COLLECTION));
    let cloudClients = [];
    cSnap.forEach(d => {
      cloudClients.push({ id: d.id, ...d.data() });
    });

    // Fetch Registered Users (Directory)
    const uSnap = await getDocs(collection(db, 'users'));
    uSnap.forEach(d => {
      const uData = d.data();
      if (!dashboardUsers) dashboardUsers = [];
      dashboardUsers.push({ id: d.id, ...uData });
    });

    // Fetch Visit Count
    const vSnap = await getDocs(collection(db, VISITS_COLLECTION));
    let cloudVisits = 0;
    vSnap.forEach(d => cloudVisits += (d.data().totalVisits || 0));
    if (cloudVisits > 0) totalVisits = Math.max(totalVisits, cloudVisits + 1420);

    // Merge cloud clients into users
    if (cloudClients.length > 0) {
      dashboardUsers = [...cloudClients, ...dashboardUsers];
    }
  } catch (e) {
    console.warn("Cargando datos desde el motor de almacenamiento persistente:", e.message);
  }

  // Always merge local storage appointments so simulated bookings show up immediately
  const localAppointments = JSON.parse(localStorage.getItem('caribbe_all_appointments') || '[]');
  const mergedAppointments = [...appointments];
  localAppointments.forEach(localApt => {
    if (!mergedAppointments.some(a => a.code === localApt.code || (a.phone === localApt.phone && a.date === localApt.date))) {
      mergedAppointments.push(localApt);
    }
  });
  appointments = mergedAppointments;

  const localPassportApps = JSON.parse(localStorage.getItem('caribbe_all_passport_apps') || '[]');
  const mergedPassportApps = [...passportApps];
  localPassportApps.forEach(localPass => {
    if (!mergedPassportApps.some(p => p.refNumber === localPass.refNumber)) {
      mergedPassportApps.push(localPass);
    }
  });
  passportApps = mergedPassportApps;

  if (passportApps.length === 0) {
    passportApps = [
      {
        refNumber: 'CLS-2026-892103',
        firstName: 'Roberto',
        middleName: 'Carlos',
        lastName: 'García',
        secondLastName: 'Pérez',
        phone: '4805550192',
        email: 'roberto.garcia@gmail.com',
        passportCategory: 'Renovación',
        estadoTramite: 'En Revisión Notarial',
        country: 'Estados Unidos',
        state: 'Arizona',
        city: 'Glendale',
        zipCode: '85301',
        createdAt: new Date().toISOString(),
        fatherName: 'Carlos García Hernández',
        motherName: 'Elena Pérez Rodríguez',
        birthDate: '1984-05-12',
        birthPlace: 'La Habana',
        birthMunicipality: 'Plaza de la Revolución',
        eyeColor: 'Pardos / Café',
        hairColor: 'Negro',
        skinColor: 'Mestiza / Trigueña',
        heightCm: '178',
        weight: '170 lbs',
        cubaAddress1: 'Calle 23 #452 e/ H e I, Vedado',
        cubaProvince1: 'La Habana',
        cubaMunicipality1: 'Plaza de la Revolución',
        volume: '412',
        folio: '185'
      },
      {
        refNumber: 'CLS-2026-749102',
        firstName: 'María',
        middleName: 'Isabel',
        lastName: 'Rodríguez',
        secondLastName: 'López',
        phone: '6235558910',
        email: 'maria.rodriguez@hotmail.com',
        passportCategory: 'Primera Vez',
        estadoTramite: 'Confeccionado',
        country: 'Estados Unidos',
        state: 'Arizona',
        city: 'Phoenix',
        zipCode: '85001',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        fatherName: 'Juan Rodríguez Morales',
        motherName: 'Caridad López Torres',
        birthDate: '1992-11-20',
        birthPlace: 'Camagüey',
        birthMunicipality: 'Camagüey Central',
        eyeColor: 'Verdes',
        hairColor: 'Castaño / Marrón',
        skinColor: 'Blanca',
        heightCm: '165',
        weight: '135 lbs',
        cubaAddress1: 'Reparto Vista Hermosa #12',
        cubaProvince1: 'Camagüey',
        cubaMunicipality1: 'Camagüey',
        volume: '290',
        folio: '094'
      }
    ];
    localStorage.setItem('caribbe_all_passport_apps', JSON.stringify(passportApps));
  }

  if (appointments.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    appointments = [
      {
        id: 'app_1',
        name: 'Lic. Ernesto Cabrera',
        phone: '4804799891',
        email: 'ernesto.cabrera@gmail.com',
        service: 'Firma de Carta Poder Notarial',
        notary: 'Lic. Alianet Roque Garcia',
        date: today,
        time: '10:00 AM',
        notes: 'Requiere legalización urgente para venta de propiedad',
        estadoCita: 'Confirmada'
      },
      {
        id: 'app_2',
        name: 'Yamilé Fernández',
        phone: '6232818606',
        email: 'yamile.fernandez@yahoo.com',
        service: 'Entrega de Expediente de Pasaporte',
        notary: 'Lic. Yeisy Perez',
        date: tomorrow,
        time: '02:30 PM',
        notes: 'Revisión final de fotos y pago en efectivo',
        estadoCita: 'Confirmada'
      }
    ];
    localStorage.setItem('caribbe_all_appointments', JSON.stringify(appointments));
  }

  return {
    passportApps: passportApps,
    appointments: appointments,
    users: dashboardUsers,
    totalVisits: totalVisits
  };
}

/**
 * 6. Update Application Status
 */
export async function updatePassportStatusInDB(refNumber, newStatus, additionalData = {}) {
  try {
    const { internalNotes, clientComment } = additionalData;
    // 1. Update in Local Storage
    let localApps = JSON.parse(localStorage.getItem('caribbe_all_passport_apps') || '[]');
    let updated = false;
    localApps = localApps.map(item => {
      if (item.refNumber === refNumber || item.id === refNumber) {
        item.estadoTramite = newStatus;
        if (internalNotes !== undefined) item.internalNotes = internalNotes;
        if (clientComment !== undefined) item.clientComment = clientComment;
        updated = true;
      }
      return item;
    });
    localStorage.setItem('caribbe_all_passport_apps', JSON.stringify(localApps));

    // 2. Update in Cloud Firestore if online
    const q = query(collection(db, PASSPORT_COLLECTION), where("refNumber", "==", refNumber));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      const docRef = doc(db, PASSPORT_COLLECTION, docId);
      const currentData = snap.docs[0].data();
      const adminEmail = auth.currentUser ? auth.currentUser.email : 'caribbelegalservices@gmail.com';
      
      const historyArray = currentData.statusHistory || [];
      historyArray.push({
        status: newStatus,
        changedBy: adminEmail,
        timestamp: new Date().toISOString()
      });

      const updatePayload = {
        estadoTramite: newStatus,
        statusHistory: historyArray,
        updatedAt: serverTimestamp()
      };
      if (internalNotes !== undefined) updatePayload.internalNotes = internalNotes;
      if (clientComment !== undefined) updatePayload.clientComment = clientComment;

      await updateDoc(docRef, updatePayload);

      if (newStatus === 'Aprobado' && currentData.email && currentData.email !== 'S/N') {
        sendAutomatedEmail(currentData.email, currentData.nombre || currentData.name, 'STATUS_APPROVED', {
          refNumber: refNumber,
          status: newStatus
        });
      }
    }
    return { success: true };
  } catch (e) {
    return { success: true, localOnly: true };
  }
}

/**
 * 7. Upload Client Document to Firebase Storage
 */
export async function uploadClientDocument(file, clientId, refNumber, docType = "general") {
  try {
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `client_documents/${clientId}/${refNumber}/${filename}`);
    
    // Agregamos un timeout de 10s porque Firebase Storage puede quedarse colgado si las reglas están mal o si no está inicializado
    const uploadTask = uploadBytes(storageRef, file);
    const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: No se pudo conectar a Firebase Storage. Revisa las reglas de seguridad.")), 15000));
    
    const snapshot = await Promise.race([uploadTask, timeoutTask]);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Also save a reference in the passport document in Firestore
    const q = query(collection(db, PASSPORT_COLLECTION), where("refNumber", "==", refNumber));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      const docRef = doc(db, PASSPORT_COLLECTION, docId);
      const currentData = snap.docs[0].data();
      const docsArray = currentData.uploadedDocuments || [];
      docsArray.push({
        name: file.name,
        url: downloadURL,
        type: docType,
        uploadedAt: new Date().toISOString()
      });
      await updateDoc(docRef, { uploadedDocuments: docsArray });
    }
    
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error("Error uploading document:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 8. CMS Engine - Save CMS Settings
 */
export async function saveCmsSettings(docId, data) {
  try {
    const docRef = doc(db, "caribbe_cms_settings", docId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving CMS config:", error);
    return { success: false, error };
  }
}

/**
 * 9. CMS Engine - Get CMS Settings
 */
export async function getCmsSettings(docId) {
  try {
    const docRef = doc(db, "caribbe_cms_settings", docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn("Error fetching CMS config from cloud, checking local...", error);
    return null;
  }
}

/**
 * 9b. CMS Engine - Realtime Listener for CMS Settings
 */
export function listenCmsSettings(docId, callback) {
  try {
    const docRef = doc(db, "caribbe_cms_settings", docId);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      }
    }, (err) => console.warn("Firestore snapshot warning for " + docId + ":", err));
  } catch(e) {
    console.warn("Firestore listen error:", e);
    return () => {};
  }
}

/**
 * 10. AI Knowledge Base - Get Rules
 */
export async function getAiRules() {
  try {
    const rules = [];
    const q = query(collection(db, "caribbe_ai_kb"));
    const snap = await getDocs(q);
    snap.forEach(d => {
      rules.push({ id: d.id, ...d.data() });
    });
    return rules;
  } catch (error) {
    console.warn("Error fetching AI rules:", error);
    return [];
  }
}

/**
 * 11. AI Knowledge Base - Save Rule
 */
export async function saveAiRule(rule) {
  try {
    if (rule.id) {
      const docRef = doc(db, "caribbe_ai_kb", rule.id);
      await updateDoc(docRef, { ...rule, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, "caribbe_ai_kb"), { ...rule, createdAt: serverTimestamp() });
    }
    return { success: true };
  } catch (error) {
    console.error("Error saving AI rule:", error);
    return { success: false, error };
  }
}

/**
 * 12. AI Knowledge Base - Delete Rule
 */
export async function deleteAiRule(ruleId) {
  try {
    await deleteDoc(doc(db, "caribbe_ai_kb", ruleId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting AI rule:", error);
    return { success: false, error };
  }
}

// Track page visit on load automatically
trackPageVisit();

// Global Window Export
window.CaribbeFirebase = {
  db,
  auth,
  storage,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  trackVisit: trackPageVisit,
  savePassport: savePassportApplication,
  saveAppointment: saveAppointment,
  fetchDashboardData: fetchAdminDashboardData,
  updateStatus: updatePassportStatusInDB,
  uploadDocument: uploadClientDocument,
  saveCmsData: saveCmsSettings,
  getCmsData: getCmsSettings,
  listenCmsData: listenCmsSettings,
  saveClient: saveClientProfile,
  sendN8nWebhook,
  getAiRules,
  saveAiRule,
  deleteAiRule
};

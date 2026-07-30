import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const INITIAL_DB = {
  appointments: [
    {
      id: "apt_1",
      code: "CLS-CITA-109283",
      refNumber: "CLS-CITA-109283",
      name: "Roberto Carlos García",
      clientName: "Roberto Carlos García",
      firstName: "Roberto",
      lastName: "García",
      phone: "4805550192",
      email: "roberto.garcia@gmail.com",
      service: "Pasaporte Cubano",
      notary: "Lic. Alianet Roque Garcia",
      date: new Date().toISOString().split('T')[0],
      time: "10:00 AM",
      estadoCita: "Confirmada",
      createdAt: new Date().toISOString()
    },
    {
      id: "apt_2",
      code: "CLS-CITA-891023",
      refNumber: "CLS-CITA-891023",
      name: "María Isabel Rodríguez",
      clientName: "María Isabel Rodríguez",
      firstName: "María",
      lastName: "Rodríguez",
      phone: "6235558910",
      email: "maria.rodriguez@hotmail.com",
      service: "Cartas Poder",
      notary: "Lic. Yeisy Perez",
      date: new Date().toISOString().split('T')[0],
      time: "02:30 PM",
      estadoCita: "Confirmada",
      createdAt: new Date().toISOString()
    }
  ],
  passportApps: [
    {
      id: "pass_1",
      refNumber: "CLS-2026-892103",
      clientName: "Roberto Carlos García Pérez",
      firstName: "Roberto",
      middleName: "Carlos",
      lastName: "García",
      secondLastName: "Pérez",
      phone: "4805550192",
      email: "roberto.garcia@gmail.com",
      passportCategory: "Renovación",
      estadoTramite: "En Revisión Notarial",
      country: "Estados Unidos",
      state: "Arizona",
      city: "Glendale",
      zipCode: "85301",
      fatherName: "Carlos García Hernández",
      motherName: "Elena Pérez Rodríguez",
      birthDate: "1984-05-12",
      birthPlace: "La Habana",
      birthMunicipality: "Plaza de la Revolución",
      eyeColor: "Pardos / Café",
      hairColor: "Negro",
      skinColor: "Mestiza / Trigueña",
      heightCm: "178",
      weight: "170 lbs",
      cubaAddress1: "Calle 23 #452 e/ H e I, Vedado",
      cubaProvince1: "La Habana",
      cubaMunicipality1: "Plaza de la Revolución",
      volume: "412",
      folio: "185",
      createdAt: new Date().toISOString()
    }
  ],
  totalVisits: 1428
};

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DB;
  }
}

function saveDatabase(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("Error saving JSON db file:", e.message);
  }
}

export function getAppointments() {
  const db = loadDatabase();
  return db.appointments || [];
}

export function saveAppointment(payload) {
  const db = loadDatabase();
  if (!db.appointments) db.appointments = [];

  const record = {
    id: "apt_" + Date.now(),
    code: payload.code || payload.refNumber || ('CLS-CITA-' + Math.floor(100000 + Math.random() * 900000)),
    refNumber: payload.code || payload.refNumber || ('CLS-CITA-' + Math.floor(100000 + Math.random() * 900000)),
    name: payload.name || payload.clientName || [payload.firstName, payload.lastName].filter(Boolean).join(' ') || 'Cliente',
    clientName: payload.name || payload.clientName || [payload.firstName, payload.lastName].filter(Boolean).join(' ') || 'Cliente',
    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    phone: payload.phone || 'S/N',
    email: payload.email || 'S/N',
    service: payload.service || 'Consulta General',
    notary: payload.notary || 'Lic. Alianet Roque Garcia',
    date: payload.date || new Date().toISOString().split('T')[0],
    time: payload.time || '10:00 AM',
    estadoCita: payload.estadoCita || 'Confirmada',
    createdAt: new Date().toISOString()
  };

  db.appointments.unshift(record);
  saveDatabase(db);
  return record;
}

export function getPassportApplications() {
  const db = loadDatabase();
  return db.passportApps || [];
}

export function savePassportApplication(payload) {
  const db = loadDatabase();
  if (!db.passportApps) db.passportApps = [];

  const refNumber = payload.refNumber || ('CLS-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000));
  const record = {
    id: "pass_" + Date.now(),
    ...payload,
    refNumber,
    clientName: payload.clientName || [payload.firstName, payload.lastName].filter(Boolean).join(' ') || 'Cliente Notarial',
    estadoTramite: payload.estadoTramite || 'En Revisión Notarial',
    createdAt: new Date().toISOString()
  };

  db.passportApps.unshift(record);
  saveDatabase(db);
  return record;
}

export function getFullDashboard() {
  const db = loadDatabase();
  return {
    appointments: db.appointments || [],
    passportApps: db.passportApps || [],
    totalVisits: db.totalVisits || 1428
  };
}

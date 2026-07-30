import { v4 as uuidv4 } from 'uuid';

const passportMemoryDB = [];

export async function createPassportApplication(payload) {
  const refNumber = 'CLS-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
  const application = {
    id: uuidv4(),
    refNumber,
    ...payload,
    estadoTramite: payload.estadoTramite || 'En Revisión Notarial',
    createdAt: new Date().toISOString()
  };

  passportMemoryDB.unshift(application);
  return application;
}

export async function getAllPassportApplications(filters = {}) {
  let list = [...passportMemoryDB];
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(item => item.estadoTramite === filters.status);
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(item => 
      (item.refNumber && item.refNumber.toLowerCase().includes(q)) ||
      (item.firstName && item.firstName.toLowerCase().includes(q)) ||
      (item.lastName && item.lastName.toLowerCase().includes(q)) ||
      (item.phone && item.phone.includes(q))
    );
  }
  return list;
}

export async function getPassportApplicationByRef(refNumber) {
  return passportMemoryDB.find(p => p.refNumber === refNumber || p.id === refNumber);
}

export async function updatePassportStatus(refNumber, newStatus) {
  const item = passportMemoryDB.find(p => p.refNumber === refNumber || p.id === refNumber);
  if (!item) {
    throw new Error(`Expediente con código '${refNumber}' no encontrado.`);
  }
  item.estadoTramite = newStatus;
  item.updatedAt = new Date().toISOString();
  return item;
}

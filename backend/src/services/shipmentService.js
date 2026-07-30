import { v4 as uuidv4 } from 'uuid';

const shipmentsDB = [
  {
    id: 'shp_101',
    trackingNumber: 'CLS-CUBA-90124',
    senderName: 'Carlos Morales',
    receiverName: 'Yolanda Morales',
    receiverProvince: 'La Habana',
    receiverMunicipality: 'Diez de Octubre',
    weightLbs: 18.5,
    type: 'Aéreo Express (Comida/Medicina)',
    pricePerLb: 6.50,
    totalPrice: 120.25,
    status: 'En Transit Aéreo',
    flightNumber: 'AA-2401',
    createdAt: new Date().toISOString()
  }
];

export async function createShipment(payload) {
  const trackingNumber = 'CLS-CUBA-' + Math.floor(100000 + Math.random() * 900000);
  const shipment = {
    id: uuidv4(),
    trackingNumber,
    ...payload,
    status: payload.status || 'Recibido en Almacén Glendale',
    createdAt: new Date().toISOString()
  };

  shipmentsDB.unshift(shipment);
  return shipment;
}

export async function getShipments() {
  return shipmentsDB;
}

export async function trackShipment(trackingNumber) {
  const item = shipmentsDB.find(s => s.trackingNumber === trackingNumber || s.id === trackingNumber);
  if (!item) {
    throw new Error(`Envío '${trackingNumber}' no encontrado.`);
  }
  return item;
}

export async function updateShipmentStatus(trackingNumber, status) {
  const item = await trackShipment(trackingNumber);
  item.status = status;
  item.updatedAt = new Date().toISOString();
  return item;
}

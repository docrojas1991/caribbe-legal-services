const auditMemoryStore = [];

export async function saveAuditLog(logPayload) {
  auditMemoryStore.unshift(logPayload);
  if (auditMemoryStore.length > 500) {
    auditMemoryStore.pop();
  }
  return logPayload;
}

export async function getAuditLogs(filters = {}) {
  let logs = [...auditMemoryStore];
  if (filters.role) {
    logs = logs.filter(l => l.role === filters.role);
  }
  if (filters.userId) {
    logs = logs.filter(l => l.userId === filters.userId);
  }
  return logs;
}

const AUDIT_KEY = "pahachan-access-audit";

function read() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(rows) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(rows.slice(0, 500)));
}

/**
 * Demo audit trail (browser). Production must insert into pahachan_audit_events via API.
 */
export function recordAudit({
  actorId,
  actorEmail,
  action,
  result = "success",
  brandId = null,
  recordType = null,
  recordId = null,
  meta = {},
}) {
  const entry = {
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    actorId,
    actorEmail,
    action,
    result,
    brandId,
    recordType,
    recordId,
    meta,
  };
  const rows = read();
  rows.unshift(entry);
  write(rows);
  return entry;
}

export function listAudit({ brandIds = null, limit = 100 } = {}) {
  let rows = read();
  if (Array.isArray(brandIds)) {
    const set = new Set(brandIds);
    rows = rows.filter((r) => !r.brandId || set.has(r.brandId));
  }
  return rows.slice(0, limit);
}

export function clearAuditDemo() {
  localStorage.removeItem(AUDIT_KEY);
}

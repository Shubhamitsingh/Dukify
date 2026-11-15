/**
 * Data scope — separate from role and permission.
 * Scope types:
 * - all_brands: every brand (platform owner default)
 * - selected_brands: only listed brand IDs
 * - assigned_records: only records explicitly assigned to the user
 * - brand: single brand (brand roles)
 */

export const SCOPE_TYPES = {
  ALL_BRANDS: "all_brands",
  SELECTED_BRANDS: "selected_brands",
  ASSIGNED_RECORDS: "assigned_records",
  BRAND: "brand",
};

export const SCOPE_LABELS = {
  [SCOPE_TYPES.ALL_BRANDS]: "All brands",
  [SCOPE_TYPES.SELECTED_BRANDS]: "Selected brands",
  [SCOPE_TYPES.ASSIGNED_RECORDS]: "Assigned records only",
  [SCOPE_TYPES.BRAND]: "Single brand",
};

/** Normalize session scope into a consistent object. */
export function normalizeScope(raw = {}) {
  const type = raw.type || SCOPE_TYPES.SELECTED_BRANDS;
  return {
    type,
    brandIds: Array.isArray(raw.brandIds) ? [...raw.brandIds] : raw.brandId ? [raw.brandId] : [],
    brandId: raw.brandId || (Array.isArray(raw.brandIds) ? raw.brandIds[0] : null) || null,
    assignedRecordIds: Array.isArray(raw.assignedRecordIds) ? [...raw.assignedRecordIds] : [],
  };
}

export function scopeAllowsBrand(scope, brandId) {
  if (!brandId) return false;
  const s = normalizeScope(scope);
  if (s.type === SCOPE_TYPES.ALL_BRANDS) return true;
  if (s.type === SCOPE_TYPES.BRAND) return s.brandId === brandId || s.brandIds.includes(brandId);
  if (s.type === SCOPE_TYPES.SELECTED_BRANDS) return s.brandIds.includes(brandId);
  // assigned_records: brand allowed only if at least one assigned record is for that brand
  // (record ids may be order/ticket ids — brand check needs record lookup at call site)
  return s.brandIds.includes(brandId);
}

export function scopeAllowsRecord(scope, recordId, recordBrandId) {
  const s = normalizeScope(scope);
  if (s.type === SCOPE_TYPES.ASSIGNED_RECORDS) {
    return s.assignedRecordIds.includes(recordId);
  }
  return scopeAllowsBrand(s, recordBrandId);
}

export function filterRowsByScope(rows, scope, getBrandId, getRecordId = (r) => r.id) {
  const s = normalizeScope(scope);
  if (s.type === SCOPE_TYPES.ALL_BRANDS) return rows;
  if (s.type === SCOPE_TYPES.ASSIGNED_RECORDS) {
    const set = new Set(s.assignedRecordIds);
    return rows.filter((r) => set.has(getRecordId(r)));
  }
  return rows.filter((r) => scopeAllowsBrand(s, getBrandId(r)));
}

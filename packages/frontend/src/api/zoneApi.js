/**
 * Create core zone API client for zone CRUD and member assignment.
 * Uses core backend (GET/POST/PATCH/DELETE /zones, /zones/:id/users).
 * @param {string} coreUrl - Base URL for core API (e.g. https://api.example.com/api/knf)
 * @param {string} token - X-Knf-Token
 * @param {object} axiosLib - Axios (or axios.create) from the host app
 * @returns {Object} API with getPlayerZones, getManagedZones, createZone, updateZone, deleteZone, getZoneUsers, assignZoneUser, removeZoneUser
 */
export function createCoreZoneApi(coreUrl, token, axiosLib) {
  if (!axiosLib || typeof axiosLib.create !== 'function') {
    throw new Error('createCoreZoneApi(coreUrl, token, axios) requires axios as third argument')
  }
  const base = (coreUrl || '').replace(/\/$/, '')
  const api = axiosLib.create({
    baseURL: base,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Knf-Token': token || '',
    },
  })

  return {
    /** GET /player/zones — zones user belongs to + is_manager */
    getPlayerZones: () => api.get('/player/zones'),
    /** GET /player/managed-zones — zones user can manage */
    getManagedZones: () => api.get('/player/managed-zones'),
    /** GET /zones — list (manager only) */
    getZones: (params) => api.get('/zones', { params }),
    /** POST /zones — create (manager only) */
    createZone: (data) => api.post('/zones', data),
    /** PUT /zones/:id — update (manager only) */
    updateZone: (id, data) => api.put(`/zones/${id}`, data),
    /** DELETE /zones/:id — delete (manager only) */
    deleteZone: (id) => api.delete(`/zones/${id}`),
    /** GET /zones/:id/users — server users + assigned (manager only) */
    getZoneUsers: (zoneId, params) => api.get(`/zones/${zoneId}/users`, { params }),
    /** POST /zones/:id/users — assign user (manager only) */
    assignZoneUser: (zoneId, userId) => api.post(`/zones/${zoneId}/users`, { user_id: userId }),
    /** DELETE /zones/:id/users/:userId — remove user (manager only) */
    removeZoneUser: (zoneId, userId) => api.delete(`/zones/${zoneId}/users/${userId}`),
  }
}

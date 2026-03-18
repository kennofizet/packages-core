<template>
  <div class="knf-core-zone-setting" :class="{ 'knf-core-zone-setting--dark': effectiveDarkMode }">
    <div class="knf-core-zone-setting__header">
      <h2 class="knf-core-zone-setting__title">{{ t.title }}</h2>
      <button v-if="isManager" type="button" class="knf-core-zone-setting__btn knf-core-zone-setting__btn--primary" @click="handleCreate">
        {{ t.create }}
      </button>
    </div>

    <div v-if="loading" class="knf-core-zone-setting__loading">{{ t.loading }}</div>
    <div v-if="error" class="knf-core-zone-setting__error">{{ error }}</div>

    <template v-if="!loading && !error">
      <template v-if="isManager">
        <div class="knf-core-zone-setting__filters">
          <input v-model="filters.search" type="text" class="knf-core-zone-setting__input" :placeholder="t.searchPlaceholder" @input="loadZones" />
        </div>
        <div class="knf-core-zone-setting__table-wrap">
          <table class="knf-core-zone-setting__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{{ t.name }}</th>
                <th>{{ t.actions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="zone in zones" :key="zone.id" class="knf-core-zone-setting__row">
                <td>{{ zone.id }}</td>
                <td>{{ zone.name }}</td>
                <td class="knf-core-zone-setting__actions">
                  <button type="button" class="knf-core-zone-setting__btn knf-core-zone-setting__btn--edit" @click="handleEdit(zone)">{{ t.edit }}</button>
                  <button type="button" class="knf-core-zone-setting__btn knf-core-zone-setting__btn--members" @click="handleManageMembers(zone)">{{ t.members }}</button>
                  <button type="button" class="knf-core-zone-setting__btn knf-core-zone-setting__btn--danger" @click="handleDelete(zone)">{{ t.delete }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template v-else>
        <p class="knf-core-zone-setting__readonly">{{ t.readonlyMessage }}</p>
        <ul v-if="playerZones.length" class="knf-core-zone-setting__list">
          <li v-for="z in playerZones" :key="z.id">{{ z.name }} (ID: {{ z.id }})</li>
        </ul>
      </template>
    </template>

    <!-- Create/Edit modal -->
    <div v-if="showModal" class="knf-core-zone-setting__overlay" @click.self="closeModal">
      <div class="knf-core-zone-setting__modal">
        <div class="knf-core-zone-setting__modal-header">
          <h3>{{ editingZone ? t.edit : t.create }}</h3>
          <button type="button" class="knf-core-zone-setting__btn-close" @click="closeModal" aria-label="Close">×</button>
        </div>
        <div class="knf-core-zone-setting__modal-body">
          <div class="knf-core-zone-setting__form-group">
            <label class="knf-core-zone-setting__label">{{ t.name }}</label>
            <input v-model="formData.name" type="text" class="knf-core-zone-setting__input knf-core-zone-setting__input--full" required />
          </div>
        </div>
        <div class="knf-core-zone-setting__modal-footer">
          <button type="button" class="knf-core-zone-setting__btn knf-core-zone-setting__btn--secondary" @click="closeModal">{{ t.cancel }}</button>
          <button type="button" class="knf-core-zone-setting__btn knf-core-zone-setting__btn--primary" :disabled="saveLoading" @click="handleSave">
            {{ saveLoading ? t.saving : (editingZone ? t.update : t.create) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Members modal -->
    <div v-if="showMembersModal" class="knf-core-zone-setting__overlay" @click.self="showMembersModal = false">
      <div class="knf-core-zone-setting__modal knf-core-zone-setting__modal--wide">
        <div class="knf-core-zone-setting__modal-header">
          <h3>{{ t.membersModalTitle }}</h3>
          <button type="button" class="knf-core-zone-setting__btn-close" @click="showMembersModal = false" aria-label="Close">×</button>
        </div>
        <div class="knf-core-zone-setting__modal-body">
          <div v-if="membersLoading" class="knf-core-zone-setting__loading">{{ t.loading }}</div>
          <template v-else>
            <div class="knf-core-zone-setting__filters knf-core-zone-setting__filters--modal">
              <input v-model="membersFilter.search" type="text" class="knf-core-zone-setting__input knf-core-zone-setting__input--full" :placeholder="t.membersSearchPlaceholder" @input="loadZoneMembers(currentZone && currentZone.id)" />
              <select v-model="membersFilter.assigned" class="knf-core-zone-setting__select knf-core-zone-setting__select--full" @change="loadZoneMembers(currentZone && currentZone.id)">
                <option value="">{{ t.all }}</option>
                <option value="1">{{ t.assigned }}</option>
                <option value="0">{{ t.unassigned }}</option>
              </select>
            </div>
            <table class="knf-core-zone-setting__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{{ t.name }}</th>
                  <th>{{ t.status }}</th>
                  <th>{{ t.actions }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in serverUsers" :key="user.id" class="knf-core-zone-setting__row">
                  <td>{{ user.id }}</td>
                  <td>{{ user.name || user.username || user.email || '—' }}</td>
                  <td>
                    <span class="knf-core-zone-setting__badge" :class="user.assigned ? 'knf-core-zone-setting__badge--assigned' : 'knf-core-zone-setting__badge--unassigned'">
                      {{ user.assigned ? t.assigned : t.unassigned }}
                    </span>
                  </td>
                  <td>
                    <button v-if="!user.assigned" type="button" class="knf-core-zone-setting__btn knf-core-zone-setting__btn--primary" @click="handleAssign(user)">{{ t.assign }}</button>
                    <button v-else type="button" class="knf-core-zone-setting__btn knf-core-zone-setting__btn--secondary" @click="handleRemove(user)">{{ t.remove }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>
        <div class="knf-core-zone-setting__modal-footer">
          <button type="button" class="knf-core-zone-setting__btn knf-core-zone-setting__btn--secondary" @click="showMembersModal = false">{{ t.close }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed, isRef } from 'vue'
import { getZoneSettingT } from '../translations/zoneSetting.js'

const props = defineProps({
  /** UI language: 'vi' | 'en'. Can be a ref. */
  language: { type: [String, Object], default: 'vi' },
  /** Dark mode. Can be a ref (e.g. isDark). */
  darkMode: { type: [Boolean, Object], default: false },
})

const effectiveLanguage = computed(() => (isRef(props.language) ? props.language.value : props.language))
const effectiveDarkMode = computed(() => (isRef(props.darkMode) ? props.darkMode.value : props.darkMode))

const t = computed(() => {
  const lang = effectiveLanguage.value === 'vi' ? 'vi' : 'en'
  return {
    title: getZoneSettingT(lang, 'title'),
    create: getZoneSettingT(lang, 'create'),
    edit: getZoneSettingT(lang, 'edit'),
    update: getZoneSettingT(lang, 'update'),
    delete: getZoneSettingT(lang, 'delete'),
    members: getZoneSettingT(lang, 'members'),
    actions: getZoneSettingT(lang, 'actions'),
    name: getZoneSettingT(lang, 'name'),
    cancel: getZoneSettingT(lang, 'cancel'),
    loading: getZoneSettingT(lang, 'loading'),
    saving: getZoneSettingT(lang, 'saving'),
    searchPlaceholder: getZoneSettingT(lang, 'searchPlaceholder'),
    readonlyMessage: getZoneSettingT(lang, 'readonlyMessage'),
    membersModalTitle: getZoneSettingT(lang, 'membersModalTitle'),
    membersSearchPlaceholder: getZoneSettingT(lang, 'membersSearchPlaceholder'),
    all: getZoneSettingT(lang, 'all'),
    assigned: getZoneSettingT(lang, 'assigned'),
    unassigned: getZoneSettingT(lang, 'unassigned'),
    status: getZoneSettingT(lang, 'status'),
    assign: getZoneSettingT(lang, 'assign'),
    remove: getZoneSettingT(lang, 'remove'),
    close: getZoneSettingT(lang, 'close'),
    confirmDelete: (name) => getZoneSettingT(lang, 'confirmDelete', { name: name || '' }),
  }
})

const api = inject('zoneApi', inject('knfCoreZoneApi', null))
if (!api) {
  console.warn('ZoneSetting: zoneApi (or knfCoreZoneApi) not provided.')
}

const loading = ref(true)
const error = ref(null)
const isManager = ref(false)
const playerZones = ref([])
const zones = ref([])
const filters = ref({ search: '' })
const showModal = ref(false)
const editingZone = ref(null)
const formData = ref({ name: '' })
const saveLoading = ref(false)
const showMembersModal = ref(false)
const currentZone = ref(null)
const membersLoading = ref(false)
const serverUsers = ref([])
const membersFilter = ref({ search: '', assigned: '' })

function normalizeZones(resp) {
  if (!resp || !resp.data) return []
  const d = resp.data.datas || resp.data
  const list = d.zones || d
  return Array.isArray(list) ? list : []
}

function normalizeIsManager(resp) {
  if (!resp || !resp.data) return false
  const d = resp.data.datas || resp.data
  return !!d.is_manager
}

async function loadPlayerZones() {
  if (!api || !api.getPlayerZones) return
  loading.value = true
  error.value = null
  try {
    const resp = await api.getPlayerZones()
    playerZones.value = normalizeZones(resp)
    isManager.value = normalizeIsManager(resp)
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to load zones'
    playerZones.value = []
    isManager.value = false
  } finally {
    loading.value = false
  }
}

async function loadZones() {
  if (!api || !api.getManagedZones) return
  try {
    const resp = await api.getManagedZones()
    let list = normalizeZones(resp)
    const q = (filters.value.search || '').toLowerCase()
    if (q) list = list.filter(z => (z.name || '').toLowerCase().includes(q))
    zones.value = list
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to load zones'
    zones.value = []
  }
}

onMounted(async () => {
  await loadPlayerZones()
  if (isManager.value) await loadZones()
})

function handleCreate() {
  editingZone.value = null
  formData.value = { name: '' }
  showModal.value = true
}

function handleEdit(zone) {
  editingZone.value = zone
  formData.value = { name: zone.name || '' }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSave() {
  if (!api) return
  saveLoading.value = true
  try {
    if (editingZone.value) {
      await api.updateZone(editingZone.value.id, { name: formData.value.name })
    } else {
      await api.createZone({ name: formData.value.name })
    }
    await loadZones()
    closeModal()
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to save zone'
  } finally {
    saveLoading.value = false
  }
}

async function handleDelete(zone) {
  const msg = t.value.confirmDelete(zone.name)
  if (!confirm(msg)) return
  if (!api || !api.deleteZone) return
  try {
    await api.deleteZone(zone.id)
    await loadZones()
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to delete zone'
  }
}

async function handleManageMembers(zone) {
  currentZone.value = zone
  showMembersModal.value = true
  await loadZoneMembers(zone.id)
}

async function loadZoneMembers(zoneId) {
  if (!zoneId || !api || !api.getZoneUsers) return
  membersLoading.value = true
  try {
    const params = { search: membersFilter.value.search || undefined }
    const resp = await api.getZoneUsers(zoneId, params)
    const d = resp?.data?.datas || resp?.data || resp
    const users = d.users || d.data || []
    const assignedIds = d.assigned_user_ids || []
    const mapped = (Array.isArray(users) ? users : []).map(u => ({ ...u, assigned: assignedIds.includes(u.id) }))
    const want = membersFilter.value.assigned
    if (want === '1') serverUsers.value = mapped.filter(u => u.assigned)
    else if (want === '0') serverUsers.value = mapped.filter(u => !u.assigned)
    else serverUsers.value = mapped
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to load members'
    serverUsers.value = []
  } finally {
    membersLoading.value = false
  }
}

async function handleAssign(user) {
  if (!currentZone.value || !api || !api.assignZoneUser) return
  try {
    await api.assignZoneUser(currentZone.value.id, user.id)
    await loadZoneMembers(currentZone.value.id)
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to assign'
  }
}

async function handleRemove(user) {
  if (!currentZone.value || !api || !api.removeZoneUser) return
  try {
    await api.removeZoneUser(currentZone.value.id, user.id)
    await loadZoneMembers(currentZone.value.id)
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Failed to remove'
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');

/* ========== Light mode (default) ========== */
.knf-core-zone-setting {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  color: #1a1a1a;
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.knf-core-zone-setting__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.knf-core-zone-setting__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.knf-core-zone-setting__btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.knf-core-zone-setting__btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.knf-core-zone-setting__btn--primary {
  background: #1a1a2e;
  color: #fff;
  border-color: #1a1a2e;
}

.knf-core-zone-setting__btn--primary:hover:not(:disabled) {
  background: #2d2d44;
  border-color: #2d2d44;
}

.knf-core-zone-setting__btn--secondary {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.knf-core-zone-setting__btn--secondary:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.knf-core-zone-setting__btn--edit {
  background: #4b5563;
  color: #fff;
  border-color: #4b5563;
  margin-right: 6px;
}

.knf-core-zone-setting__btn--members {
  background: #059669;
  color: #fff;
  border-color: #059669;
  margin-right: 6px;
}

.knf-core-zone-setting__btn--danger {
  background: #dc2626;
  color: #fff;
  border-color: #dc2626;
}

.knf-core-zone-setting__btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
  color: #6b7280;
}

.knf-core-zone-setting__btn-close:hover {
  color: #1a1a1a;
}

.knf-core-zone-setting__loading,
.knf-core-zone-setting__error {
  padding: 16px;
  font-size: 14px;
}

.knf-core-zone-setting__error {
  color: #dc2626;
}

.knf-core-zone-setting__readonly {
  color: #6b7280;
  margin-bottom: 12px;
  line-height: 1.5;
}

.knf-core-zone-setting__list {
  margin: 0;
  padding-left: 20px;
  color: #374151;
}

.knf-core-zone-setting__filters {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.knf-core-zone-setting__input,
.knf-core-zone-setting__select {
  font-family: inherit;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1a1a1a;
  background: #ffffff;
  box-sizing: border-box;
}

.knf-core-zone-setting__input--full,
.knf-core-zone-setting__select--full {
  width: 100%;
  max-width: 100%;
  display: block;
}

.knf-core-zone-setting__form-group .knf-core-zone-setting__input--full {
  width: 100%;
}

.knf-core-zone-setting__select {
  cursor: pointer;
  appearance: auto;
}

.knf-core-zone-setting__select option {
  background-color: #ffffff;
  color: #1a1a1a;
  padding: 8px;
}

.knf-core-zone-setting__input:focus,
.knf-core-zone-setting__select:focus {
  outline: none;
  border-color: #1a1a2e;
  box-shadow: 0 0 0 2px rgba(26, 26, 46, 0.15);
}

/* Members modal: search + filter on one row */
.knf-core-zone-setting__filters--modal {
  flex-direction: row;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 10px;
  margin-bottom: 16px;
}

.knf-core-zone-setting__filters--modal .knf-core-zone-setting__input--full {
  flex: 1;
  min-width: 0;
  width: auto;
  min-height: 42px;
}

.knf-core-zone-setting__filters--modal .knf-core-zone-setting__select--full {
  flex: 0 0 auto;
  width: auto;
  min-width: 160px;
  max-width: 220px;
  min-height: 42px;
}

.knf-core-zone-setting__table-wrap {
  overflow-x: auto;
}

.knf-core-zone-setting__table {
  width: 100%;
  border-collapse: collapse;
}

.knf-core-zone-setting__table th,
.knf-core-zone-setting__table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.knf-core-zone-setting__table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.knf-core-zone-setting__row:hover {
  background: #f9fafb;
}

.knf-core-zone-setting__actions {
  white-space: nowrap;
}

.knf-core-zone-setting__badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.knf-core-zone-setting__badge--assigned {
  background: #059669;
  color: #fff;
}

.knf-core-zone-setting__badge--unassigned {
  background: #6b7280;
  color: #fff;
}

.knf-core-zone-setting__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.knf-core-zone-setting__modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.knf-core-zone-setting__modal--wide {
  max-width: 720px;
}

.knf-core-zone-setting__modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.knf-core-zone-setting__modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.knf-core-zone-setting__modal-body {
  padding: 20px;
}

.knf-core-zone-setting__modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.knf-core-zone-setting__form-group {
  margin-bottom: 16px;
}

.knf-core-zone-setting__label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

/* ========== Dark mode ========== */
.knf-core-zone-setting--dark {
  color: #e6eef6;
  background: transparent;
  box-shadow: none;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__title {
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn--primary {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border-color: transparent;
  color: #fff;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.4);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn--secondary {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn--edit {
  background: rgba(75, 85, 99, 0.6);
  border-color: rgba(255, 255, 255, 0.15);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn--members {
  background: rgba(5, 150, 105, 0.3);
  border-color: rgba(0, 242, 255, 0.3);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn--danger {
  background: rgba(220, 38, 38, 0.4);
  border-color: rgba(220, 38, 38, 0.5);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn-close {
  color: #94a3b8;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__btn-close:hover {
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__loading,
.knf-core-zone-setting--dark .knf-core-zone-setting__readonly,
.knf-core-zone-setting--dark .knf-core-zone-setting__list {
  color: #94a3b8;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__error {
  color: #f87171;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__input,
.knf-core-zone-setting--dark .knf-core-zone-setting__select {
  background-color: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__modal .knf-core-zone-setting__input,
.knf-core-zone-setting--dark .knf-core-zone-setting__modal .knf-core-zone-setting__select {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__modal .knf-core-zone-setting__input:hover,
.knf-core-zone-setting--dark .knf-core-zone-setting__modal .knf-core-zone-setting__select:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__select option {
  background-color: #1a1a2e;
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__modal .knf-core-zone-setting__select option {
  background-color: #252540;
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__input::placeholder {
  color: #94a3b8;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__input:focus,
.knf-core-zone-setting--dark .knf-core-zone-setting__select:focus {
  border-color: rgba(0, 242, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(0, 242, 255, 0.2);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__modal .knf-core-zone-setting__input:focus,
.knf-core-zone-setting--dark .knf-core-zone-setting__modal .knf-core-zone-setting__select:focus {
  border-color: rgba(0, 242, 255, 0.55);
  box-shadow: 0 0 0 2px rgba(0, 242, 255, 0.25);
}

/* Light: modal fields on white panel */
.knf-core-zone-setting__modal .knf-core-zone-setting__input,
.knf-core-zone-setting__modal .knf-core-zone-setting__select {
  background: #ffffff;
  border-color: #d1d5db;
  color: #1a1a1a;
}

.knf-core-zone-setting__modal .knf-core-zone-setting__select option {
  background-color: #ffffff;
  color: #1a1a1a;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__table th,
.knf-core-zone-setting--dark .knf-core-zone-setting__table td {
  border-bottom-color: rgba(255, 255, 255, 0.08);
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__table th {
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__badge--assigned {
  background: rgba(0, 242, 255, 0.25);
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__badge--unassigned {
  background: rgba(148, 163, 184, 0.3);
  color: #94a3b8;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__overlay {
  background: rgba(0, 0, 0, 0.7);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__modal {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 242, 255, 0.08);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__modal-header h3 {
  color: #e6eef6;
}

.knf-core-zone-setting--dark .knf-core-zone-setting__modal-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.knf-core-zone-setting--dark .knf-core-zone-setting__label {
  color: #94a3b8;
}
</style>

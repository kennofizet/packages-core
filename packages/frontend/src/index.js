const TOKEN_KEY = 'knf_core_token'

import { createCoreZoneApi } from './api/zoneApi.js'
import ZoneSetting from './components/ZoneSetting.vue'
import axios from 'axios'

export { createCoreZoneApi }

/**
 * Register ZoneSetting and provide zone API. Use in Vue app setup.
 * @param {Object} app - Vue app instance
 * @param {Object} zoneApi - Result of createCoreZoneApi(coreUrl, token, axios)
 */
export function installZoneSetting(app, options = {}) {    
    if (options.coreUrl != null && options.token != null) {
        const zoneApi = createCoreZoneApi(options.coreUrl, options.token, axios)
        app.provide('knfCoreZoneApi', zoneApi)
        app.config.globalProperties.$zoneApi = zoneApi
    }

    app.component('KnfCoreZoneSetting', ZoneSetting)
}

export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY) || null
}

export function applyToken(axiosIns, token) {
    localStorage.setItem(TOKEN_KEY, token)
    axiosIns.defaults.headers.common['x-knf-token'] = token
}

export function clearToken(axiosIns) {
    localStorage.removeItem(TOKEN_KEY)
    delete axiosIns.defaults.headers.common['x-knf-token']
}

export function restoreToken(axiosIns) {
    const token = getStoredToken()
    if (token) axiosIns.defaults.headers.common['x-knf-token'] = token
    return token
}

export async function login(axiosIns, endpoint = 'user/login') {
    const res = await axiosIns.get(endpoint)
    const token = res.data?.knf_token || res.data?.token
    if (!token) throw new Error(res.data?.error || 'No token returned')
    applyToken(axiosIns, token)
    return token
}

export {
    ZoneSetting,
}

export default {
    install: installZoneSetting,
}
  
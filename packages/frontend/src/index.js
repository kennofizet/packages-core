const TOKEN_KEY = 'knf_core_token'

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

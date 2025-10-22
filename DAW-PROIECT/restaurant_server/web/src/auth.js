import { api, getCsrf } from './api';

export async function me() { const { data } = await api.get('/auth/me'); return data.user || null; }
export async function login(email, password) { await getCsrf(); const { data } = await api.post('/auth/login', { email, password }); return data.user; }
export async function register(name, email, password, role = 'client') {
    await getCsrf();
    const { data } = await api.post('/auth/register', { name, email, password, role });
    return data.user;
}
export async function logout() { await getCsrf(); await api.post('/auth/logout', {}); }

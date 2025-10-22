import axios from 'axios';
export const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    withCredentials: true,
});
export async function getCsrf() {
    const { data } = await api.get('/csrf-token');
    api.defaults.headers.common['X-CSRF-Token'] = data.token;
}
export function money(n) { return Number(n).toFixed(2) + ' RON'; }

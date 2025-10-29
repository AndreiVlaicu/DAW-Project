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

// ia statusurile permise
export async function getOrderStatuses() {
    const r = await api.get('/admin/order-statuses');
    return r.data;
}

// schimbă statusul unei comenzi (doar angajat)
export async function updateOrderStatus(id, to_status) {
    await getCsrf();
    const r = await api.patch(`/admin/orders/${id}/status`, { to_status });
    return r.data;
}

// comenzile mele (client)
export async function myOrders() {
    const r = await api.get('/my-orders');
    return r.data;
}

// comenzile pentru admin (angajat)
export async function adminOrders() {
    const r = await api.get('/admin/orders');
    return r.data;
}


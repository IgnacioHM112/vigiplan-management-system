import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const objetivosAPI = {
  listar: () => api.get('/objetivos'),
  obtener: (id) => api.get(`/objetivos/${id}`),
  crear: (data) => api.post('/objetivos', data),
  actualizar: (id, data) => api.put(`/objetivos/${id}`, data),
  eliminar: (id) => api.delete(`/objetivos/${id}`),
};

export const puestosAPI = {
  listar: () => api.get('/puestos'),
  listarPorObjetivo: (idObjetivo) => api.get(`/puestos/por-objetivo/${idObjetivo}`),
  obtener: (id) => api.get(`/puestos/${id}`),
  crear: (data) => api.post('/puestos', data),
  actualizar: (id, data) => api.put(`/puestos/${id}`, data),
  eliminar: (id) => api.delete(`/puestos/${id}`),
};

export const turnosConfigAPI = {
  listar: () => api.get('/turnos-config'),
  listarPorObjetivo: (idObjetivo) => api.get(`/turnos-config/por-objetivo/${idObjetivo}`),
  obtener: (id) => api.get(`/turnos-config/${id}`),
  crear: (data) => api.post('/turnos-config', data),
  actualizar: (id, data) => api.put(`/turnos-config/${id}`, data),
  eliminar: (id) => api.delete(`/turnos-config/${id}`),
};

export const vigiladoresAPI = {
  listar: () => api.get('/vigiladores'),
  obtener: (id) => api.get(`/vigiladores/${id}`),
  crear: (data) => api.post('/vigiladores', data),
  actualizar: (id, data) => api.put(`/vigiladores/${id}`, data),
  eliminar: (id) => api.delete(`/vigiladores/${id}`),
};

export const requerimientosAPI = {
  listar: (params) => api.get('/requerimientos', { params }),
  generarMensual: (data) => api.post('/requerimientos/generar-mensual', data),
};

export const asignacionesAPI = {
  listar: (params) => api.get('/asignaciones', { params }),
  crear: (data) => api.post('/asignaciones', data),
  validar: (data) => api.post('/asignaciones/validar', data),
  generarProyectado: (data) => api.post('/asignaciones/generar-proyectado', data),
  actualizarEstado: (id, data) => api.put(`/asignaciones/${id}/estado`, data),
  eliminar: (id) => api.delete(`/asignaciones/${id}`),
};

export default api;

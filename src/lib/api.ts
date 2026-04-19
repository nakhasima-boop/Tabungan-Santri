import axios from 'axios';

const api = axios.create({
  baseURL: '/api/gas',
});

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.error) {
      return Promise.reject(new Error(response.data.error));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getSiswa = async (params?: { q?: string }) => {
  const res = await api.get('', { params: { action: 'getSiswa', ...params } });
  return res.data;
};

export const getTransaksi = async (params?: { type?: string; startDate?: string; endDate?: string; studentId?: string; q?: string }) => {
  const res = await api.get('', { params: { action: 'getTransaksi', ...params } });
  return res.data;
};

export const getDashboardData = async () => {
  const res = await api.get('', { params: { action: 'getDashboard' } });
  return res.data;
};

export const addSiswa = async (data: any) => {
  const res = await api.post('', { action: 'addSiswa', ...data });
  return res.data;
};

export const updateSiswa = async (data: any) => {
  const res = await api.post('', { action: 'updateSiswa', ...data });
  return res.data;
};

export const deleteSiswa = async (id: string) => {
  const res = await api.post('', { action: 'deleteSiswa', id_siswa: id });
  return res.data;
};

export const addTransaksi = async (data: any) => {
  const res = await api.post('', { action: 'addTransaksi', ...data });
  return res.data;
};

export const getAdmins = async () => {
  const res = await api.get('', { params: { action: 'getAdmins' } });
  return res.data;
};

export const updateAdmin = async (data: { username: string; newNama?: string; newPassword?: string }) => {
  const res = await api.post('', { action: 'updateAdmin', ...data });
  return res.data;
};

export const addAdmin = async (data: any) => {
  const res = await api.post('', { action: 'addAdmin', ...data });
  return res.data;
};

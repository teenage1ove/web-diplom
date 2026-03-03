import { axiosInstance } from '@shared/lib/axios/axiosInstance';
import type {
  Consultation,
  ConsultationStats,
  ConsultationsListResponse,
  CreateConsultationData,
  UpdateConsultationData,
  GetConsultationsParams,
} from '../model/types';

const BASE = '/consultations';

export const consultationsApi = {
  async getConsultations(params?: GetConsultationsParams): Promise<ConsultationsListResponse> {
    const { data } = await axiosInstance.get(BASE, { params });
    return data;
  },

  async getConsultationById(id: number): Promise<Consultation> {
    const { data } = await axiosInstance.get(`${BASE}/${id}`);
    return data.consultation;
  },

  async createConsultation(consultationData: CreateConsultationData): Promise<Consultation> {
    const { data } = await axiosInstance.post(BASE, consultationData);
    return data.consultation;
  },

  async updateConsultation(id: number, consultationData: UpdateConsultationData): Promise<Consultation> {
    const { data } = await axiosInstance.put(`${BASE}/${id}`, consultationData);
    return data.consultation;
  },

  async cancelConsultation(id: number): Promise<Consultation> {
    const { data } = await axiosInstance.patch(`${BASE}/${id}/cancel`);
    return data.consultation;
  },

  async getStats(): Promise<ConsultationStats> {
    const { data } = await axiosInstance.get(`${BASE}/stats`);
    return data.stats;
  },

  async getTrainers(): Promise<{ trainers: Array<{ id: number; specialization: string[]; bio: string | null; experienceYears: number | null; hourlyRate: number | null; rating: number; user: { id: number; firstName: string; lastName: string; email: string } }> }> {
    const { data } = await axiosInstance.get('/trainers');
    return data;
  },
};

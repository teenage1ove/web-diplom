export type SessionType = 'one_time' | 'recurring' | 'package';
export type ConsultationStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface TrainerInfo {
  id: number;
  specialization: string[];
  bio: string | null;
  experienceYears: number | null;
  hourlyRate: number | null;
  rating: number;
  totalReviews: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface Consultation {
  id: number;
  userId: number;
  trainerId: number;
  sessionType: SessionType;
  title: string;
  description: string | null;
  scheduledDate: string;
  durationMinutes: number;
  status: ConsultationStatus;
  meetingLink: string | null;
  price: number | null;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
  trainer: TrainerInfo;
  messages?: ConsultationMessage[];
}

export interface ConsultationMessage {
  id: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateConsultationData {
  trainerId: number;
  sessionType: SessionType;
  title: string;
  description?: string | null;
  scheduledDate: string;
  durationMinutes?: number;
  notes?: string | null;
}

export interface UpdateConsultationData {
  sessionType?: SessionType;
  title?: string;
  description?: string | null;
  scheduledDate?: string;
  durationMinutes?: number;
  status?: ConsultationStatus;
  meetingLink?: string | null;
  notes?: string | null;
}

export interface ConsultationStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  upcoming: Consultation[];
}

export interface ConsultationsListResponse {
  consultations: Consultation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetConsultationsParams {
  page?: number;
  limit?: number;
  status?: ConsultationStatus;
  trainerId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  one_time: 'Разовая',
  recurring: 'Регулярная',
  package: 'Пакет',
};

export const STATUS_LABELS: Record<ConsultationStatus, string> = {
  scheduled: 'Запланирована',
  confirmed: 'Подтверждена',
  in_progress: 'В процессе',
  completed: 'Завершена',
  cancelled: 'Отменена',
};

export const STATUS_COLORS: Record<ConsultationStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

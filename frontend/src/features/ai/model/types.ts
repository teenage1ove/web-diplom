export type RecommendationType = 'workout' | 'nutrition' | 'general';
export type UserFeedback = 'helpful' | 'not_helpful';

export interface AIRecommendation {
  id: number;
  userId: number;
  recommendationType: RecommendationType;
  context: Record<string, unknown> | null;
  prompt: string;
  recommendationText: string;
  aiModel: string | null;
  metadata: Record<string, unknown> | null;
  isApplied: boolean;
  userFeedback: UserFeedback | null;
  createdAt: string;
}

export interface RecommendationsListResponse {
  recommendations: AIRecommendation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const RECOMMENDATION_TYPE_LABELS: Record<RecommendationType, string> = {
  workout: 'Тренировки',
  nutrition: 'Питание',
  general: 'Общие',
};

export const RECOMMENDATION_TYPE_ICONS: Record<RecommendationType, string> = {
  workout: '💪',
  nutrition: '🥗',
  general: '✨',
};

import { axiosInstance } from '@shared/lib/axios/axiosInstance';
import type { AIRecommendation, RecommendationsListResponse, RecommendationType, UserFeedback } from '../model/types';

const BASE = '/ai';

export const aiApi = {
  async generateRecommendation(
    type: RecommendationType,
    context?: { question?: string }
  ): Promise<AIRecommendation> {
    const { data } = await axiosInstance.post(`${BASE}/recommend`, { type, context });
    return data.recommendation;
  },

  async getRecommendations(
    type?: RecommendationType,
    page?: number,
    limit?: number
  ): Promise<RecommendationsListResponse> {
    const { data } = await axiosInstance.get(`${BASE}/recommendations`, {
      params: { type, page, limit },
    });
    return data;
  },

  async applyRecommendation(id: number): Promise<AIRecommendation> {
    const { data } = await axiosInstance.patch(`${BASE}/recommendations/${id}/apply`);
    return data.recommendation;
  },

  async feedbackRecommendation(id: number, feedback: UserFeedback): Promise<AIRecommendation> {
    const { data } = await axiosInstance.patch(`${BASE}/recommendations/${id}/feedback`, { feedback });
    return data.recommendation;
  },
};

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, RECOMMENDATION_TYPE_LABELS, RECOMMENDATION_TYPE_ICONS } from '@features/ai';
import type { RecommendationType, AIRecommendation } from '@features/ai';

const AIAssistantPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<RecommendationType>('general');
  const [question, setQuestion] = useState('');
  const [filterType, setFilterType] = useState<RecommendationType | undefined>(undefined);

  const { data, isLoading: isLoadingList } = useQuery({
    queryKey: ['ai-recommendations', filterType],
    queryFn: () => aiApi.getRecommendations(filterType, 1, 20),
  });

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateRecommendation(selectedType, { question: question || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      setQuestion('');
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback: 'helpful' | 'not_helpful' }) =>
      aiApi.feedbackRecommendation(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    },
  });

  const types: RecommendationType[] = ['workout', 'nutrition', 'general'];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('ru-RU', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Помощник</h1>
        <p className="text-sm text-gray-500">
          Получайте персональные рекомендации на основе ваших данных
        </p>
      </div>

      {/* Generate section */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Получить рекомендацию</h2>

        <div className="mb-4 flex gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{RECOMMENDATION_TYPE_ICONS[t]}</span>
              {RECOMMENDATION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              selectedType === 'workout'
                ? 'Например: Составь программу тренировок для набора мышечной массы на 3 дня в неделю'
                : selectedType === 'nutrition'
                ? 'Например: Какое питание лучше для похудения при тренировках 3 раза в неделю?'
                : 'Например: Как улучшить качество сна для лучшего восстановления?'
            }
          />
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
        >
          {generateMutation.isPending ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Генерация...
            </span>
          ) : (
            'Получить рекомендацию'
          )}
        </button>

        {generateMutation.error && (
          <p className="mt-2 text-sm text-red-500">
            Ошибка: {generateMutation.error instanceof Error ? generateMutation.error.message : 'Не удалось сгенерировать'}
          </p>
        )}
      </div>

      {/* History */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">История рекомендаций</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType(undefined)}
              className={`rounded-lg px-3 py-1 text-xs font-medium ${
                !filterType ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Все
            </button>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`rounded-lg px-3 py-1 text-xs font-medium ${
                  filterType === t ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {RECOMMENDATION_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {isLoadingList ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
          </div>
        ) : !data?.recommendations.length ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">Нет рекомендаций</p>
            <p className="text-sm text-gray-400">Запросите первую рекомендацию выше</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.recommendations.map((rec: AIRecommendation) => (
              <div
                key={rec.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {RECOMMENDATION_TYPE_ICONS[rec.recommendationType]}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {RECOMMENDATION_TYPE_LABELS[rec.recommendationType]}
                    </span>
                    {rec.isApplied && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                        Применено
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(rec.createdAt)}</span>
                </div>

                <div className="mb-3 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {rec.recommendationText}
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-400 mr-2">Было полезно?</span>
                  <button
                    onClick={() =>
                      feedbackMutation.mutate({ id: rec.id, feedback: 'helpful' })
                    }
                    className={`rounded px-2 py-1 text-xs transition-colors ${
                      rec.userFeedback === 'helpful'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-50 text-gray-500 hover:bg-green-50'
                    }`}
                  >
                    👍 Да
                  </button>
                  <button
                    onClick={() =>
                      feedbackMutation.mutate({ id: rec.id, feedback: 'not_helpful' })
                    }
                    className={`rounded px-2 py-1 text-xs transition-colors ${
                      rec.userFeedback === 'not_helpful'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-50 text-gray-500 hover:bg-red-50'
                    }`}
                  >
                    👎 Нет
                  </button>
                  {rec.aiModel === 'fallback' && (
                    <span className="ml-auto text-xs text-yellow-500">
                      Автономная рекомендация
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantPage;

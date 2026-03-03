import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationsApi, STATUS_LABELS, STATUS_COLORS, SESSION_TYPE_LABELS } from '@features/consultations';
import type { ConsultationStatus } from '@features/consultations';

const ConsultationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ConsultationStatus | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['consultations', statusFilter],
    queryFn: () => consultationsApi.getConsultations({ status: statusFilter, limit: 50 }),
  });

  const { data: stats } = useQuery({
    queryKey: ['consultation-stats'],
    queryFn: () => consultationsApi.getStats(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => consultationsApi.cancelConsultation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultation-stats'] });
    },
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('ru-RU', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const statuses: (ConsultationStatus | undefined)[] = [undefined, 'scheduled', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Консультации</h1>
          <p className="text-sm text-gray-500">Запись и управление консультациями с тренерами</p>
        </div>
        <button
          onClick={() => navigate('/consultations/new')}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Записаться
        </button>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Всего</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
            <p className="text-xs text-gray-500">Запланировано</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500">Завершено</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-gray-500">Отменено</p>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s ? STATUS_LABELS[s] : 'Все'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
        </div>
      ) : data?.consultations.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg font-medium text-gray-600">Нет консультаций</p>
          <p className="mt-1 text-sm text-gray-400">Запишитесь на первую консультацию к тренеру</p>
          <button
            onClick={() => navigate('/consultations/new')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Записаться
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.consultations.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/consultations/${c.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Тренер: {c.trainer.user.firstName} {c.trainer.user.lastName}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>{formatDate(c.scheduledDate)}</span>
                    <span>{c.durationMinutes} мин</span>
                    <span>{SESSION_TYPE_LABELS[c.sessionType]}</span>
                    {c.price && <span>{Number(c.price)} руб.</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {['scheduled', 'confirmed'].includes(c.status) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Отменить консультацию?')) {
                          cancelMutation.mutate(c.id);
                        }
                      }}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsultationsPage;

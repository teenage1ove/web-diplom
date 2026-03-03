import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationsApi, STATUS_LABELS, STATUS_COLORS, SESSION_TYPE_LABELS } from '@features/consultations';

const ConsultationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const consultationId = parseInt(id || '0');

  const { data: consultation, isLoading } = useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: () => consultationsApi.getConsultationById(consultationId),
    enabled: consultationId > 0,
  });

  const cancelMutation = useMutation({
    mutationFn: () => consultationsApi.cancelConsultation(consultationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
      </div>
    );
  }

  if (!consultation) {
    return <div className="py-12 text-center text-gray-500">Консультация не найдена</div>;
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const canCancel = ['scheduled', 'confirmed'].includes(consultation.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button
        onClick={() => navigate('/consultations')}
        className="mb-4 text-sm text-blue-600 hover:text-blue-700"
      >
        &larr; Назад к консультациям
      </button>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{consultation.title}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[consultation.status]}`}
                >
                  {STATUS_LABELS[consultation.status]}
                </span>
              </div>
              {consultation.description && (
                <p className="mt-2 text-sm text-gray-600">{consultation.description}</p>
              )}
            </div>
            {canCancel && (
              <button
                onClick={() => {
                  if (window.confirm('Отменить консультацию?')) {
                    cancelMutation.mutate();
                  }
                }}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Отменить
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">Детали</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Дата и время</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(consultation.scheduledDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Длительность</p>
                <p className="text-sm font-medium text-gray-900">
                  {consultation.durationMinutes} минут
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Тип</p>
                <p className="text-sm font-medium text-gray-900">
                  {SESSION_TYPE_LABELS[consultation.sessionType]}
                </p>
              </div>
              {consultation.price && (
                <div>
                  <p className="text-xs text-gray-400">Стоимость</p>
                  <p className="text-sm font-medium text-gray-900">
                    {Number(consultation.price)} руб.
                  </p>
                </div>
              )}
              {consultation.meetingLink && (
                <div>
                  <p className="text-xs text-gray-400">Ссылка на встречу</p>
                  <a
                    href={consultation.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Перейти
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">Тренер</h3>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-900">
                {consultation.trainer.user.firstName} {consultation.trainer.user.lastName}
              </p>
              <p className="text-sm text-gray-500">{consultation.trainer.user.email}</p>
              {consultation.trainer.specialization.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {consultation.trainer.specialization.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-400">
                Рейтинг: {Number(consultation.trainer.rating)}/5
                {consultation.trainer.experienceYears &&
                  ` | Опыт: ${consultation.trainer.experienceYears} лет`}
              </div>
              <button
                onClick={() => navigate(`/chat?userId=${consultation.trainer.user.id}&name=${encodeURIComponent(consultation.trainer.user.firstName + ' ' + consultation.trainer.user.lastName)}`)}
                className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Написать тренеру
              </button>
            </div>
          </div>
        </div>

        {consultation.notes && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Заметки</h3>
            <p className="text-sm text-gray-700">{consultation.notes}</p>
          </div>
        )}

        {consultation.messages && consultation.messages.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">Сообщения</h3>
            <div className="space-y-3">
              {consultation.messages.map((msg) => (
                <div key={msg.id} className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">
                      {msg.sender.firstName} {msg.sender.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-800">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationDetailPage;

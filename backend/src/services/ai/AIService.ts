import axios from 'axios';
import { RecommendationType } from '@prisma/client';
import { prisma } from '../../config/database';
import { config } from '../../config/env';
import { BadRequestError } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent`;

interface GenerateRecommendationData {
  type: RecommendationType;
  context?: Record<string, unknown>;
}

const SYSTEM_RULES = [
  'ФОРМАТ ОТВЕТА:',
  '- Отвечай ТОЛЬКО на русском языке.',
  '- НЕ используй Markdown-разметку: никаких **, ##, -, ``` и подобных символов.',
  '- Используй обычный текст с переносами строк для структуры.',
  '- Нумеруй пункты цифрами с точкой (1. 2. 3.).',
  '- НЕ представляйся, НЕ здоровайся, НЕ прощайся.',
  '- Сразу начинай с сути.',
  '- Ответ должен быть ПОЛНОСТЬЮ завершён, не обрывайся на полуслове.',
  '- Длина ответа: 1000-1500 символов. Это жёсткий лимит.',
  '- Если не хватает места — сократи, но ОБЯЗАТЕЛЬНО заверши последнее предложение.',
].join('\n');

export class AIService {
  async generateRecommendation(userId: number, data: GenerateRecommendationData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        gender: true,
        height: true,
        weight: true,
        dateOfBirth: true,
        fitnessGoals: {
          where: { status: 'active' },
          take: 3,
          select: { title: true, goalType: true, targetValue: true, currentValue: true },
        },
        workouts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { title: true, workoutType: true, durationMinutes: true, caloriesBurned: true, status: true },
        },
        meals: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { mealType: true, calories: true, proteinGrams: true, carbsGrams: true, fatsGrams: true },
        },
      },
    });

    if (!user) throw new BadRequestError('User not found');

    const prompt = this.buildPrompt(data.type, user, data.context);

    try {
      if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY.startsWith('your_') || config.GEMINI_API_KEY === 'test_api_key_replace_with_real') {
        throw new Error('Gemini API key not configured');
      }

      const response = await axios.post(
        `${GEMINI_URL}?key=${config.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            thinkingConfig: { thinkingBudget: 0 },
          },
        },
        { timeout: 30000 }
      );

      let text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Не удалось сгенерировать рекомендацию';

      // Strip any markdown that slipped through
      text = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^[-•]\s+/gm, '')
        .replace(/```[\s\S]*?```/g, '')
        .trim();

      const recommendation = await prisma.aIRecommendation.create({
        data: {
          userId,
          recommendationType: data.type,
          context: (data.context || {}) as any,
          prompt,
          recommendationText: text,
          aiModel: config.GEMINI_MODEL,
        },
      });

      logger.info('AI recommendation generated: ' + recommendation.id + ' for user ' + userId);
      return recommendation;
    } catch (error: unknown) {
      const axiosErr = error as { response?: { status?: number; data?: { error?: { message?: string } } }; message?: string };
      const errMsg = axiosErr?.response?.data?.error?.message || axiosErr?.message || 'Unknown error';
      const statusCode = axiosErr?.response?.status;
      logger.error('Gemini API error (status: ' + statusCode + '): ' + errMsg);

      const fallbackText = this.getFallback(data.type);
      const recommendation = await prisma.aIRecommendation.create({
        data: {
          userId,
          recommendationType: data.type,
          context: (data.context || {}) as any,
          prompt,
          recommendationText: fallbackText,
          aiModel: 'fallback',
          metadata: { error: errMsg } as any,
        },
      });

      return recommendation;
    }
  }

  async getRecommendations(userId: number, type?: RecommendationType, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { userId };
    if (type) where.recommendationType = type;

    const [recommendations, total] = await Promise.all([
      prisma.aIRecommendation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aIRecommendation.count({ where }),
    ]);

    return { recommendations, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async applyRecommendation(recommendationId: number, userId: number) {
    const rec = await prisma.aIRecommendation.findFirst({
      where: { id: recommendationId, userId },
    });
    if (!rec) throw new BadRequestError('Recommendation not found');

    return prisma.aIRecommendation.update({
      where: { id: recommendationId },
      data: { isApplied: true },
    });
  }

  async feedbackRecommendation(recommendationId: number, userId: number, feedback: 'helpful' | 'not_helpful') {
    const rec = await prisma.aIRecommendation.findFirst({
      where: { id: recommendationId, userId },
    });
    if (!rec) throw new BadRequestError('Recommendation not found');

    return prisma.aIRecommendation.update({
      where: { id: recommendationId },
      data: { userFeedback: feedback },
    });
  }

  private buildPrompt(
    type: RecommendationType,
    user: Record<string, unknown>,
    context?: Record<string, unknown>
  ): string {
    const userName = user.firstName || 'Пользователь';
    const gender = user.gender || 'не указан';
    const height = user.height || 'не указан';
    const weight = user.weight || 'не указан';

    const goals = (user.fitnessGoals as Array<{ title: string; goalType: string; targetValue: number | null; currentValue: number | null }>) || [];
    const goalsInfo = goals.length > 0
      ? goals.map((g) => g.title + ' (' + g.goalType + ')' + (g.targetValue ? ', цель: ' + g.targetValue : '')).join('; ')
      : 'Не установлены.';

    const workouts = (user.workouts as Array<{ title: string; workoutType: string; durationMinutes: number | null; caloriesBurned: number | null }>) || [];
    const workoutsInfo = workouts.length > 0
      ? workouts.map((w) => w.title + ' (' + w.workoutType + ', ' + (w.durationMinutes || '?') + ' мин)').join('; ')
      : 'Нет данных.';

    const userProfile = 'Профиль: ' + userName + ', ' + gender + ', рост ' + height + ' см, вес ' + weight + ' кг.';
    const questionText = (context?.question as string) || '';
    const userQuestion = questionText ? '\nВопрос пользователя: ' + questionText : '';

    switch (type) {
      case 'workout':
        return [
          'Ты — AI-ассистент фитнес-платформы. Задача: составить рекомендации по тренировкам.',
          '',
          userProfile,
          'Цели: ' + goalsInfo,
          'Последние тренировки: ' + workoutsInfo,
          userQuestion,
          '',
          SYSTEM_RULES,
          '',
          'Дай рекомендацию по тренировкам. Включи: оценку текущего уровня (1-2 предложения), конкретную программу на неделю с упражнениями, подходами и повторениями, советы по восстановлению.',
        ].join('\n');

      case 'nutrition': {
        const meals = (user.meals as Array<{ mealType: string; calories: number | null; proteinGrams: number | null; carbsGrams: number | null; fatsGrams: number | null }>) || [];
        let nutritionStats = 'Нет данных.';
        if (meals.length > 0) {
          const avgCal = Math.round(meals.reduce((s, m) => s + (m.calories || 0), 0) / meals.length);
          const avgP = Math.round(meals.reduce((s, m) => s + (Number(m.proteinGrams) || 0), 0) / meals.length);
          const avgC = Math.round(meals.reduce((s, m) => s + (Number(m.carbsGrams) || 0), 0) / meals.length);
          const avgF = Math.round(meals.reduce((s, m) => s + (Number(m.fatsGrams) || 0), 0) / meals.length);
          nutritionStats = 'Среднее за прием: ' + avgCal + ' ккал, Б ' + avgP + ' г, У ' + avgC + ' г, Ж ' + avgF + ' г.';
        }
        return [
          'Ты — AI-ассистент фитнес-платформы. Задача: составить рекомендации по питанию.',
          '',
          userProfile,
          'Цели: ' + goalsInfo,
          'Питание: ' + nutritionStats,
          'Тренировки: ' + workoutsInfo,
          userQuestion,
          '',
          SYSTEM_RULES,
          '',
          'Дай рекомендацию по питанию. Включи: рекомендуемую суточную калорийность и БЖУ, примерный план питания на день с конкретными продуктами и порциями, что добавить или исключить из рациона.',
        ].join('\n');
      }

      case 'general':
      default:
        return [
          'Ты — AI-ассистент фитнес-платформы. Задача: дать общие рекомендации по здоровью и фитнесу.',
          '',
          userProfile,
          'Цели: ' + goalsInfo,
          'Тренировки: ' + workoutsInfo,
          userQuestion,
          '',
          SYSTEM_RULES,
          '',
          'Дай общие рекомендации. Включи: оценку текущей формы, 3-5 конкретных советов для улучшения результатов, на что обратить внимание в первую очередь.',
        ].join('\n');
    }
  }

  private getFallback(type: RecommendationType): string {
    switch (type) {
      case 'workout':
        return 'Рекомендуем начать с 3 тренировок в неделю: силовая (понедельник), кардио (среда), комплексная (пятница). Каждая тренировка 45-60 минут. Не забывайте про разминку (5-10 мин) и заминку (5-10 мин). Постепенно увеличивайте нагрузку на 5-10% каждые 2 недели.';
      case 'nutrition':
        return 'Основные принципы питания: ешьте 4-5 раз в день небольшими порциями. Соотношение БЖУ: 30% белки, 40% углеводы, 30% жиры. Выпивайте 2-3 литра воды в день. Ограничьте сахар и быстрые углеводы. Ешьте больше овощей и клетчатки.';
      default:
        return 'Для достижения фитнес-целей важен баланс тренировок, питания и отдыха. Спите 7-9 часов, тренируйтесь регулярно, следите за питанием и пейте достаточно воды. Прогресс приходит с постоянством.';
    }
  }
}

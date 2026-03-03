import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '@shared/layouts/MainLayout';

// Lazy load pages
const LoginPage = React.lazy(() => import('@pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('@pages/dashboard/DashboardPage'));
const ProfilePage = React.lazy(() => import('@pages/profile/ProfilePage'));

// Goals Pages
const GoalsListPage = React.lazy(() => import('@pages/goals/GoalsListPage').then(m => ({ default: m.GoalsListPage })));
const CreateGoalPage = React.lazy(() => import('@pages/goals/CreateGoalPage').then(m => ({ default: m.CreateGoalPage })));
const EditGoalPage = React.lazy(() => import('@pages/goals/EditGoalPage').then(m => ({ default: m.EditGoalPage })));

// Workouts Pages
const WorkoutsListPage = React.lazy(() => import('@pages/workouts').then(m => ({ default: m.WorkoutsListPage })));
const CreateWorkoutPage = React.lazy(() => import('@pages/workouts').then(m => ({ default: m.CreateWorkoutPage })));
const EditWorkoutPage = React.lazy(() => import('@pages/workouts').then(m => ({ default: m.EditWorkoutPage })));
const WorkoutDetailPage = React.lazy(() => import('@pages/workouts').then(m => ({ default: m.WorkoutDetailPage })));

// Nutrition Pages
const NutritionPlansPage = React.lazy(() => import('@pages/nutrition/NutritionPlansPage'));
const CreateNutritionPlanPage = React.lazy(() => import('@pages/nutrition/CreateNutritionPlanPage'));
const EditNutritionPlanPage = React.lazy(() => import('@pages/nutrition/EditNutritionPlanPage'));
const NutritionPlanDetailPage = React.lazy(() => import('@pages/nutrition/NutritionPlanDetailPage'));

// Consultations Pages
const ConsultationsPage = React.lazy(() => import('@pages/consultations/ConsultationsPage'));
const BookConsultationPage = React.lazy(() => import('@pages/consultations/BookConsultationPage'));
const ConsultationDetailPage = React.lazy(() => import('@pages/consultations/ConsultationDetailPage'));

// Chat Page
const ChatPage = React.lazy(() => import('@pages/chat/ChatPage'));

// AI Page
const AIAssistantPage = React.lazy(() => import('@pages/ai/AIAssistantPage'));

const SuspenseLoader = (
  <div className="flex h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
  </div>
);

const protectedPage = (Component: React.ComponentType) => (
  <ProtectedRoute>
    <MainLayout>
      <React.Suspense fallback={SuspenseLoader}>
        <Component />
      </React.Suspense>
    </MainLayout>
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    path: '/login',
    element: <React.Suspense fallback={SuspenseLoader}><LoginPage /></React.Suspense>,
  },
  {
    path: '/register',
    element: <React.Suspense fallback={SuspenseLoader}><RegisterPage /></React.Suspense>,
  },
  { path: '/dashboard', element: protectedPage(DashboardPage) },
  { path: '/profile', element: protectedPage(ProfilePage) },

  // Goals
  { path: '/goals', element: protectedPage(GoalsListPage) },
  { path: '/goals/new', element: protectedPage(CreateGoalPage) },
  { path: '/goals/:id/edit', element: protectedPage(EditGoalPage) },

  // Workouts
  { path: '/workouts', element: protectedPage(WorkoutsListPage) },
  { path: '/workouts/new', element: protectedPage(CreateWorkoutPage) },
  { path: '/workouts/:id', element: protectedPage(WorkoutDetailPage) },
  { path: '/workouts/:id/edit', element: protectedPage(EditWorkoutPage) },

  // Nutrition
  { path: '/nutrition', element: protectedPage(NutritionPlansPage) },
  { path: '/nutrition/plans/new', element: protectedPage(CreateNutritionPlanPage) },
  { path: '/nutrition/plans/:id', element: protectedPage(NutritionPlanDetailPage) },
  { path: '/nutrition/plans/:id/edit', element: protectedPage(EditNutritionPlanPage) },

  // Consultations
  { path: '/consultations', element: protectedPage(ConsultationsPage) },
  { path: '/consultations/new', element: protectedPage(BookConsultationPage) },
  { path: '/consultations/:id', element: protectedPage(ConsultationDetailPage) },

  // Chat
  { path: '/chat', element: protectedPage(ChatPage) },

  // AI Assistant
  { path: '/ai', element: protectedPage(AIAssistantPage) },

  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

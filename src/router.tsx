import { Navigate, createBrowserRouter } from "react-router-dom"

import AppLayout from "@/layouts/app-layout"
import AccessSelectionPage from "@/pages/access-selection-page"
import DashboardPage from "@/pages/dashboard-page"
import LoginPage from "@/pages/login-page"
import NotFoundPage from "@/pages/not-found-page"
import ProfilePage from "@/pages/profile-page"
import CategoryPage from "@/pages/onboarding/category-page"
import ClassBatchPage from "@/pages/onboarding/class-batch-page"
import EvaluationDetailPage from "@/pages/onboarding/evaluation-detail-page"
import EvaluationFeedbackDetailPage from "@/pages/onboarding/evaluation-feedback-detail-page"
import EvaluationFeedbackPage from "@/pages/onboarding/evaluation-feedback-page"
import EvaluationScoreInputPage from "@/pages/onboarding/evaluation-score-input-page"
import HistoryPage from "@/pages/onboarding/history-page"
import JourneyOnboardingPage from "@/pages/onboarding/journey-onboarding-page"
import LearningModulesPage from "@/pages/onboarding/learning-modules-page"
import NotificationsRemindersPage from "@/pages/onboarding/notifications-reminders-page"
import RecruitmentIntegrationPage from "@/pages/onboarding/recruitment-integration-page"
import PengujiPage from "@/pages/onboarding/penguji-page"
import DaftarPenggunaPage from "@/pages/onboarding/daftar-pengguna-page"
import ClassesPage from "@/pages/onboarding/classes-page"
import LeaderboardPage from "@/pages/onboarding/leaderboard-page"
import MasterFasePage from "@/pages/onboarding/master-fase-page"
import MasterBagianEvaluasiPage from "@/pages/onboarding/master-bagian-evaluasi-page"
import MasterJabatanPage from "@/pages/onboarding/master-jabatan-page"
import MasterKategoriPelatihanPage from "@/pages/onboarding/master-kategori-pelatihan-page"

export const router = createBrowserRouter([
  {
    path: "/pilih-akses",
    element: <AccessSelectionPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/pilih-akses" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "journey-onboarding",
        element: <JourneyOnboardingPage />,
      },
      {
        path: "modul-pembelajaran-interaktif",
        element: <LearningModulesPage />,
      },
      {
        path: "evaluasi-feedback",
        element: <EvaluationFeedbackPage />,
      },
      {
        path: "evaluasi-feedback-detail",
        element: <EvaluationFeedbackDetailPage />,
      },
      {
        path: "evaluasi-input-penilaian",
        element: <EvaluationScoreInputPage />,
      },
      {
        path: "evaluasi",
        element: <EvaluationDetailPage />,
      },
      {
        path: "notifikasi-reminder-otomatis",
        element: <NotificationsRemindersPage />,
      },
      {
        path: "riwayat-onboarding",
        element: <HistoryPage />,
      },
      {
        path: "integrasi-data-rekrutment",
        element: <RecruitmentIntegrationPage />,
      },
      {
        path: "class",
        element: <ClassBatchPage />,
      },
      {
        path: "penguji",
        element: <PengujiPage />,
      },
      {
        path: "daftar-pengguna",
        element: <DaftarPenggunaPage />,
      },
      {
        path: "classes",
        element: <ClassesPage />,
      },
      {
        path: "leaderboard",
        element: <LeaderboardPage />,
      },
      {
        path: "master-fase",
        element: <MasterFasePage />,
      },
      {
        path: "master-bagian-evaluasi",
        element: <MasterBagianEvaluasiPage />,
      },
      {
        path: "master-jabatan",
        element: <MasterJabatanPage />,
      },
      {
        path: "master-kategori-pelatihan",
        element: <MasterKategoriPelatihanPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "kategori-onboarding",
        element: <CategoryPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
])

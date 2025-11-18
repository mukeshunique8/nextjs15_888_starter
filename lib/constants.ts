// lib/constants.ts
export const DB_TABLES = {
  EXAMS: 'tyro_exams',
  EXAM_RESULTS: 'tyro_exam_results',
  PROFILES: 'profiles'
} as const;

export const USER_ROLES = 'tyro_admin'
export type DbTables = typeof DB_TABLES;

export const RouteConstUrls: Record<string, string> = {
  home: '/',
  exams: '/exams',
  adminLogin: '/login',
  adminDashboard: '/admin/dashboard',
  adminExams: '/admin/exams',
  adminUploadExcel: '/admin/upload-excel'
};

// types/index.ts
export type Profile = {
  id: string;
  email?: string;
  role?: 'admin' | 'user' | string;
  full_name?: string;
};

export type Exam = {
  id: string;
  title: string;
  exam_date?: string | null;
  created_at?: string;
};
export type ExamResultRow = {
  id?: string;
  exam_id: string; // Make required since every result needs an exam_id
  student_id: string;
  mobile_number: string;
  total_mark: number | null; // Remove optional, explicit null is clearer
  scored_mark: number | null; // Remove optional, explicit null is clearer
  status: string; // Make required with default value instead of nullable
  created_at?: string;
};

// Type for parsed Excel data (before exam_id is assigned)
export type ParsedExcelRow = Omit<ExamResultRow, 'exam_id' | 'id' | 'created_at'>;

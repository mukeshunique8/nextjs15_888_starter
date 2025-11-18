// app/admin/upload-excel/page.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DB_TABLES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { ExamResultRow } from '@/lib/types';
import { parseExcelFile } from '@/lib/excel';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileSpreadsheet, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { toNumber } from '@/lib/utils';

export default function UploadExcelPage() {
  const [title, setTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const router = useRouter();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationErrors([]);
    setPreview(null);

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload an Excel file (.xlsx or .xls)'
      });
      setFile(null);
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 10MB'
      });
      setFile(null);
      return;
    }

    // Preview the file
    try {
      const rows = await parseExcelFile(selectedFile);
      setPreview(rows.slice(0, 5)); // Show first 5 rows
      toast.success('File loaded successfully', {
        description: `Found ${rows.length} records`
      });
    } catch (error: any) {
      toast.error('Failed to parse file', {
        description: error.message
      });
      setFile(null);
    }
  };

  const validateData = (rows: any[]): string[] => {
    const errors: string[] = [];

    if (rows.length === 0) {
      errors.push('No data found in the Excel file');
    }

    rows.forEach((row, index) => {
      const rowNum = index + 1;
      
      // Check Student ID
      if (!row.student_id || String(row.student_id).trim() === '') {
        errors.push(`Row ${rowNum}: Student ID is required`);
      }
      
      // Check Mobile Number
      if (!row.mobile_number || String(row.mobile_number).trim() === '') {
        errors.push(`Row ${rowNum}: Mobile number is required`);
      } else {
        const mobileStr = String(row.mobile_number).trim();
        if (!/^\d{10}$/.test(mobileStr)) {
          errors.push(`Row ${rowNum}: Invalid mobile number format (should be 10 digits)`);
        }
      }

      // Validate Total Mark
      if (row.total_mark !== null && row.total_mark !== undefined && row.total_mark !== '') {
        const totalNum = Number(row.total_mark);
        if (isNaN(totalNum)) {
          errors.push(`Row ${rowNum}: Total mark must be a number`);
        } else if (totalNum < 0) {
          errors.push(`Row ${rowNum}: Total mark cannot be negative`);
        }
      }

      // Validate Scored Mark
      if (row.scored_mark !== null && row.scored_mark !== undefined && row.scored_mark !== '') {
        const scoredNum = Number(row.scored_mark);
        if (isNaN(scoredNum)) {
          errors.push(`Row ${rowNum}: Scored mark must be a number`);
        } else if (scoredNum < 0) {
          errors.push(`Row ${rowNum}: Scored mark cannot be negative`);
        }
      }

      // Compare Total vs Scored Mark
      if (
        row.total_mark !== null && 
        row.total_mark !== undefined && 
        row.total_mark !== '' &&
        row.scored_mark !== null && 
        row.scored_mark !== undefined && 
        row.scored_mark !== ''
      ) {
        const total = Number(row.total_mark);
        const scored = Number(row.scored_mark);
        if (!isNaN(total) && !isNaN(scored) && scored > total) {
          errors.push(`Row ${rowNum}: Scored mark (${scored}) cannot be greater than total mark (${total})`);
        }
      }
    });

    return errors;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Please provide an exam title');
      return;
    }

    setLoading(true);
    setValidationErrors([]);

    try {
      const rows = await parseExcelFile(file);
      
      // Validate data
      const errors = validateData(rows);
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error('Validation failed', {
          description: `Found ${errors.length} error(s) in the data`
        });
        setLoading(false);
        return;
      }

      // Create exam
      const { data: examCreated, error: examErr } = await supabase
        .from(DB_TABLES.EXAMS)
        .insert({ title: title.trim(), exam_date: examDate || null })
        .select('*')
        .single();

      if (examErr || !examCreated) {
        throw examErr ?? new Error('Failed to create exam');
      }

      const examId = examCreated.id;



const payload: ExamResultRow[] = rows.map((r) => ({
  exam_id: examId,
  student_id: String(r.student_id).trim(),
  mobile_number: String(r.mobile_number).trim(),
  total_mark: toNumber(r.total_mark),
  scored_mark: toNumber(r.scored_mark),
  status: r.status?.trim() || 'Pending'
}));

      // Batch insert
      const { error: insertErr } = await supabase
        .from(DB_TABLES.EXAM_RESULTS)
        .insert(payload);

      if (insertErr) throw insertErr;

      toast.success('Upload successful!', {
        description: `Created exam with ${rows.length} results`
      });

      // Navigate to admin exams page
      router.push(`/admin/exams/${examId}`);
    } catch (err: any) {
      toast.error('Upload failed', {
        description: err?.message ?? 'An error occurred during upload'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/admin/exams">
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Upload Exam Results</h1>
            <p className="text-muted-foreground">Import student results from Excel file</p>
          </div>
        </div>
      </motion.div>

      {/* Instructions Card */}

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
>
  <Card className="mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
    <CardContent className="pt-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
          <FileSpreadsheet className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Excel File Requirements</h3>
            <p className="text-sm text-blue-700">
              Your Excel file must include the following columns in the first row
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur rounded-lg px-3 py-2 border border-blue-100">
              <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-700">1</span>
              </div>
              <div>
                <code className="text-sm font-mono font-semibold text-blue-900">student_id</code>
                <p className="text-xs text-blue-600">Required</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/60 backdrop-blur rounded-lg px-3 py-2 border border-blue-100">
              <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-700">2</span>
              </div>
              <div>
                <code className="text-sm font-mono font-semibold text-blue-900">mobile_number</code>
                <p className="text-xs text-blue-600">Required • 10 digits</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/60 backdrop-blur rounded-lg px-3 py-2 border border-blue-100">
              <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-700">3</span>
              </div>
              <div>
                <code className="text-sm font-mono font-semibold text-blue-900">total_mark</code>
                <p className="text-xs text-blue-600">Required • Numeric</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/60 backdrop-blur rounded-lg px-3 py-2 border border-blue-100">
              <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-700">4</span>
              </div>
              <div>
                <code className="text-sm font-mono font-semibold text-blue-900">scored_mark</code>
                <p className="text-xs text-blue-600">Required • Numeric</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/60 backdrop-blur rounded-lg px-3 py-2 border border-blue-100">
              <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-700">5</span>
              </div>
              <div>
                <code className="text-sm font-mono font-semibold text-blue-900">status</code>
                <p className="text-xs text-blue-600">Required • Text (PASS/FAIL)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Maximum file size: <span className="font-semibold">10 MB</span> • Accepted formats: <span className="font-semibold">.xlsx, .xls</span>
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</motion.div>
      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
            <CardDescription>Fill in the exam information and upload the results file</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              {/* Exam Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Exam Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mid-Term Exam 2024"
                  required
                  disabled={loading}
                />
              </div>

              {/* Exam Date */}
              <div className="space-y-2">
                <Label htmlFor="examDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Exam Date (Optional)
                </Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel File
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFile}
                      disabled={loading}
                      className="cursor-pointer"
                    />
                  </div>
                  {file && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !file}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload & Import
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong className="block mb-2">Validation Errors ({validationErrors.length}):</strong>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.slice(0, 10).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {validationErrors.length > 10 && (
                  <li className="text-muted-foreground">
                    ... and {validationErrors.length - 10} more errors
                  </li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Preview */}
      {preview && preview.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Preview</CardTitle>
              <CardDescription>First 5 rows from your Excel file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Student ID</th>
                      <th className="text-left p-2 font-semibold">Mobile</th>
                      <th className="text-left p-2 font-semibold">Total Mark</th>
                      <th className="text-left p-2 font-semibold">Scored Mark</th>
                      <th className="text-left p-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2">{row.student_id}</td>
                        <td className="p-2">{row.mobile_number}</td>
                        <td className="p-2">{row.total_mark || '-'}</td>
                        <td className="p-2">{row.scored_mark || '-'}</td>
                        <td className="p-2">{row.status || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
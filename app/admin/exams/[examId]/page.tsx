// app/admin/exams/[examId]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { DB_TABLES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { exportExamAsExcel } from '@/lib/excel';
import { motion } from 'framer-motion';
import { 
  Save, 
  Download, 
  ArrowLeft, 
  Trash2, 
  Plus,
  Calendar,
  Users,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminExamDetail() {
  const params = useParams();
  const examId = params?.examId as string;
  
  const [exam, setExam] = useState<any | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedRows, setEditedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!examId) return;
    
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: examData, error: examError } = await supabase
          .from(DB_TABLES.EXAMS)
          .select('*')
          .eq('id', examId)
          .single();

        if (examError) throw examError;

        const { data: resultRows, error: resultsError } = await supabase
          .from(DB_TABLES.EXAM_RESULTS)
          .select('*')
          .eq('exam_id', examId)
          .order('created_at', { ascending: true });

        if (resultsError) throw resultsError;

        if (!mounted) return;
        
        setExam(examData ?? null);
        setRows(resultRows ?? []);
        toast.success('Data loaded successfully');
      } catch (error: any) {
        toast.error('Failed to load exam details', {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    load();
    return () => {
      mounted = false;
    };
  }, [examId]);

  const handleChangeRow = (index: number, key: string, value: any) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
    
    // Mark row as edited
    setEditedRows((prev) => {
      const newSet = new Set(prev);
      newSet.add(rows[index].id);
      return newSet;
    });
  };

  const handleAddRow = () => {
    const newRow = {
      id: `temp-${Date.now()}`, // Temporary ID
      exam_id: examId,
      student_id: '',
      mobile_number: '',
      total_mark: null,
      scored_mark: null,
      status: 'Pending',
      isNew: true
    };
    setRows([...rows, newRow]);
    toast.info('New row added', {
      description: 'Fill in the details and save'
    });
  };

  const handleDeleteRow = async (index: number, rowId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    // If it's a new row (not yet saved), just remove it from state
    if (rowId.startsWith('temp-')) {
      setRows((prev) => prev.filter((_, i) => i !== index));
      toast.success('Row removed');
      return;
    }

    try {
      const { error } = await supabase
        .from(DB_TABLES.EXAM_RESULTS)
        .delete()
        .eq('id', rowId);

      if (error) throw error;

      setRows((prev) => prev.filter((_, i) => i !== index));
      toast.success('Record deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete record', {
        description: error.message
      });
    }
  };

  const validateRow = (row: any): string | null => {
    if (!row.student_id?.trim()) return 'Student ID is required';
    if (!row.mobile_number?.trim()) return 'Mobile number is required';
    if (!/^\d{10}$/.test(row.mobile_number)) return 'Invalid mobile number (10 digits required)';
    
    if (row.total_mark !== null && row.scored_mark !== null) {
      if (Number(row.scored_mark) > Number(row.total_mark)) {
        return 'Scored mark cannot exceed total mark';
      }
    }
    
    return null;
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Validate all rows
      for (let i = 0; i < rows.length; i++) {
        const error = validateRow(rows[i]);
        if (error) {
          toast.error(`Row ${i + 1}: ${error}`);
          setSaving(false);
          return;
        }
      }

      const newRows: any[] = [];
      const updateRows: any[] = [];

      rows.forEach((r) => {
        const payload = {
          exam_id: r.exam_id,
          student_id: r.student_id?.trim(),
          mobile_number: r.mobile_number?.trim(),
          total_mark: r.total_mark === '' || r.total_mark === null ? null : Number(r.total_mark),
          scored_mark: r.scored_mark === '' || r.scored_mark === null ? null : Number(r.scored_mark),
          status: r.status || 'Pending'
        };

        if (r.isNew || r.id.startsWith('temp-')) {
          newRows.push(payload);
        } else {
          updateRows.push({ ...payload, id: r.id });
        }
      });

      // Insert new rows
      if (newRows.length > 0) {
        const { error: insertError } = await supabase
          .from(DB_TABLES.EXAM_RESULTS)
          .insert(newRows);
        
        if (insertError) throw insertError;
      }

      // Update existing rows
      if (updateRows.length > 0) {
        const { error: updateError } = await supabase
          .from(DB_TABLES.EXAM_RESULTS)
          .upsert(updateRows, { onConflict: 'id' });
        
        if (updateError) throw updateError;
      }

      // Reload data
      const { data: resultRows } = await supabase
        .from(DB_TABLES.EXAM_RESULTS)
        .select('*')
        .eq('exam_id', examId)
        .order('created_at', { ascending: true });

      setRows(resultRows ?? []);
      setEditedRows(new Set());
      
      toast.success('Changes saved successfully', {
        description: `Updated ${updateRows.length + newRows.length} record(s)`
      });
    } catch (err: any) {
      toast.error('Failed to save changes', {
        description: err?.message ?? 'An error occurred'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    try {
      exportExamAsExcel(rows, `${exam?.title ?? 'exam'}-results.xlsx`);
      toast.success('Export successful', {
        description: 'Excel file downloaded'
      });
    } catch (error: any) {
      toast.error('Export failed', {
        description: error.message
      });
    }
  };

  if (!examId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Invalid Exam</h3>
              <p className="text-muted-foreground">The exam ID is missing or invalid</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading exam details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/admin/exams">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </Link>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{exam?.title ?? 'Exam Details'}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {exam?.exam_date
                    ? new Date(exam.exam_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'No date set'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1 text-base py-2 px-4">
                  <Users className="h-4 w-4" />
                  {rows.length} Students
                </Badge>
                {editedRows.size > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1 text-base py-2 px-4 border-yellow-500 text-yellow-700">
                    <AlertCircle className="h-4 w-4" />
                    {editedRows.size} Unsaved
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Changes
            </>
          )}
        </Button>
        <Button onClick={handleExport} variant="outline" size="lg">
          <Download className="mr-2 h-5 w-5" />
          Export Excel
        </Button>
        <Button onClick={handleAddRow} variant="outline" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Row
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Student Results
            </CardTitle>
            <CardDescription>Edit student information and marks directly in the table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Student ID</TableHead>
                    <TableHead className="w-[150px]">Mobile Number</TableHead>
                    <TableHead className="w-[120px]">Total Mark</TableHead>
                    <TableHead className="w-[120px]">Scored Mark</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[80px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No records found. Click "Add Row" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, i) => (
                      <TableRow 
                        key={r.id ?? i}
                        className={editedRows.has(r.id) ? 'bg-yellow-500 text-black' : ''}
                      >
                        <TableCell>
                          <Input
                            value={r.student_id || ''}
                            onChange={(e) => handleChangeRow(i, 'student_id', e.target.value)}
                            placeholder="Student ID"
                            className="min-w-[130px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={r.mobile_number || ''}
                            onChange={(e) => handleChangeRow(i, 'mobile_number', e.target.value)}
                            placeholder="Mobile"
                            className="min-w-[130px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={r.total_mark ?? ''}
                            onChange={(e) =>
                              handleChangeRow(i, 'total_mark', e.target.value === '' ? null : Number(e.target.value))
                            }
                            placeholder="Total"
                            className="min-w-[100px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={r.scored_mark ?? ''}
                            onChange={(e) =>
                              handleChangeRow(i, 'scored_mark', e.target.value === '' ? null : Number(e.target.value))
                            }
                            placeholder="Scored"
                            className="min-w-[100px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={r.status ?? ''}
                            onChange={(e) => handleChangeRow(i, 'status', e.target.value)}
                            placeholder="Status"
                            className="min-w-[100px]"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRow(i, r.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend */}
      {editedRows.size > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
            <span>Modified rows (unsaved changes)</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
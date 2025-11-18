// app/exams/[examId]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DB_TABLES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Search, 
  Trophy, 
  User, 
  Phone, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ExamDetailPage({ 
  params 
}: { 
  params: Promise<{ examId: string }> 
}) {
  const { examId } = use(params);
  const [mobile, setMobile] = useState('');
  const [records, setRecords] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<any | null>(null);
  const [examLoading, setExamLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setExamLoading(true);
      try {
        const { data, error } = await supabase
          .from(DB_TABLES.EXAMS)
          .select('*')
          .eq('id', examId)
          .single();

        if (error) throw error;
        setExam(data ?? null);
      } catch (error: any) {
        toast.error('Failed to load exam details', {
          description: error.message
        });
      } finally {
        setExamLoading(false);
      }
    })();
  }, [examId]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobile.trim()) {
      toast.error('Please enter a mobile number');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.EXAM_RESULTS)
        .select('*')
        .eq('exam_id', examId)
        .eq('mobile_number', mobile.trim());

      if (error) throw error;

      setRecords(data ?? []);

      if (data && data.length === 0) {
        toast.info('No results found', {
          description: 'Please check your mobile number and try again'
        });
      } else if (data && data.length > 0) {
        toast.success('Results found!', {
          description: `Found ${data.length} result(s)`
        });
      }
    } catch (error: any) {
      toast.error('Failed to fetch results', {
        description: error.message
      });
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pass')) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (statusLower.includes('fail')) return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('pass')) return 'text-green-600 bg-green-50 border-green-200';
    if (statusLower.includes('fail')) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  if (examLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading exam details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/exams">
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Button>
        </Link>
      </motion.div>

      {/* Exam Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">
                  {exam?.title ?? 'Exam Details'}
                </CardTitle>
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
              <Trophy className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Lookup Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Check Your Results</CardTitle>
            <CardDescription>
              Enter your registered mobile number to view your exam results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="mobile"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Lookup Results
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {records !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-6 space-y-4"
          >
            {records.length === 0 ? (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center gap-4">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                    <p className="text-muted-foreground">
                      No records found for mobile number: <strong>{mobile}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please verify your mobile number and try again
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Your Results ({records.length})
                </h3>
                {records.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Student Info */}
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Student ID:</span>
                              <span className="font-semibold">{record.student_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Mobile:</span>
                              <span className="font-medium">{record.mobile_number}</span>
                            </div>
                          </div>

                          {/* Score Section */}
                          <div className="flex flex-col items-center md:items-end gap-2">
                            <div className="text-center md:text-right">
                              <div className="text-3xl font-bold text-primary">
                                {record.scored_mark ?? '-'}
                                <span className="text-lg text-muted-foreground">
                                  /{record.total_mark ?? '-'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Total Score</p>
                            </div>

                            {/* Status Badge */}
                            <div
                              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {getStatusIcon(record.status)}
                              <span className="font-semibold text-sm uppercase">
                                {record.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// app/admin/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DB_TABLES } from '@/lib/constants';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Users, 
  TrendingUp, 
  Calendar,
  Upload,
  Eye,
  Award,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DashboardStats {
  totalExams: number;
  totalResults: number;
  uniqueStudents: number;
  recentExams: any[];
  passCount: number;
  failCount: number;
  pendingCount: number;
  avgScorePercentage: number;
  totalMarksAwarded: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Get total exams count
        const { count: examCount } = await supabase
          .from(DB_TABLES.EXAMS)
          .select('id', { count: 'exact', head: true });

        // Get all results for detailed analysis
        const { data: allResults } = await supabase
          .from(DB_TABLES.EXAM_RESULTS)
          .select('*');

        // Get recent exams with details
        const { data: recentExams } = await supabase
          .from(DB_TABLES.EXAMS)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!mounted) return;

        // Calculate statistics
        const totalResults = allResults?.length || 0;
        const uniqueStudents = new Set(allResults?.map(r => r.mobile_number)).size;

        // Status counts
        const passCount = allResults?.filter(r => 
          r.status?.toLowerCase().includes('pass')
        ).length || 0;
        
        const failCount = allResults?.filter(r => 
          r.status?.toLowerCase().includes('fail')
        ).length || 0;
        
        const pendingCount = allResults?.filter(r => 
          !r.status || r.status?.toLowerCase().includes('pending')
        ).length || 0;

        // Calculate average score percentage
        const validScores = allResults?.filter(r => 
          r.total_mark && r.scored_mark
        ) || [];
        
        const avgPercentage = validScores.length > 0
          ? validScores.reduce((sum, r) => 
              sum + ((r.scored_mark / r.total_mark) * 100), 0
            ) / validScores.length
          : 0;

        // Total marks awarded
        const totalMarks = allResults?.reduce((sum, r) => 
          sum + (r.scored_mark || 0), 0
        ) || 0;

        setStats({
          totalExams: examCount || 0,
          totalResults,
          uniqueStudents,
          recentExams: recentExams || [],
          passCount,
          failCount,
          pendingCount,
          avgScorePercentage: avgPercentage,
          totalMarksAwarded: totalMarks
        });

        toast.success('Dashboard loaded successfully');
      } catch (error: any) {
        toast.error('Failed to load dashboard', {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-center text-muted-foreground">Failed to load dashboard data</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your exam management system
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/upload-excel">
              <Button size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Upload Exam
              </Button>
            </Link>
            <Link href="/admin/exams">
              <Button variant="outline" size="lg">
                <Eye className="mr-2 h-5 w-5" />
                View All Exams
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Exams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Exams</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalExams}</p>
                  <p className="text-xs text-blue-700 mt-1">Created exams</p>
                </div>
                <div className="h-16 w-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Total Results</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalResults}</p>
                  <p className="text-xs text-green-700 mt-1">Result entries</p>
                </div>
                <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Unique Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Unique Students</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.uniqueStudents}</p>
                  <p className="text-xs text-purple-700 mt-1">Different students</p>
                </div>
                <div className="h-16 w-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900">Avg Score</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats.avgScorePercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-orange-700 mt-1">Overall average</p>
                </div>
                <div className="h-16 w-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Overview & Recent Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Status Distribution
              </CardTitle>
              <CardDescription>Overall result breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-green-900">Pass</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.passCount}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="font-medium text-red-900">Fail</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{stats.failCount}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Pending</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total Marks Awarded</span>
                  <span className="font-bold text-foreground">{stats.totalMarksAwarded}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Exams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Exams
                  </CardTitle>
                  <CardDescription>Latest 5 exams created</CardDescription>
                </div>
                <Link href="/admin/exams">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentExams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No exams created yet</p>
                  <Link href="/admin/upload-excel">
                    <Button className="mt-4" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Create First Exam
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentExams.map((exam, index) => (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }}
                    >
                      <Link href={`/admin/exams/${exam.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group">
                          <div className="flex-1">
                            <h4 className="font-semibold group-hover:text-primary transition-colors">
                              {exam.title}
                            </h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              {exam.exam_date
                                ? new Date(exam.exam_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'No date'}
                            </p>
                          </div>
                          <Badge variant="outline">
                            View
                          </Badge>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
// app/admin/exams/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { DB_TABLES } from '@/lib/constants';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Upload, 
  Search, 
  Edit, 
  Eye, 
  FileSpreadsheet,
  Users,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [filteredExams, setFilteredExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    let mounted = true;
    const loadExams = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(DB_TABLES.EXAMS)
          .select('*')
          .order('exam_date', { ascending: false });

        if (error) throw error;
        
        if (!mounted) return;
        
        // Get student counts for each exam
        const examsWithCounts = await Promise.all(
          (data || []).map(async (exam) => {
            const { count } = await supabase
              .from(DB_TABLES.EXAM_RESULTS)
              .select('*', { count: 'exact', head: true })
              .eq('exam_id', exam.id);
            
            return { ...exam, studentCount: count || 0 };
          })
        );

        setExams(examsWithCounts);
        setFilteredExams(examsWithCounts);
        
        // Calculate stats
        const totalExams = examsWithCounts.length;
        const totalStudents = examsWithCounts.reduce((sum, exam) => sum + exam.studentCount, 0);
        setStats({ totalExams, totalStudents });
        
        toast.success('Exams loaded successfully');
      } catch (error: any) {
        toast.error('Failed to load exams', {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadExams();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const filtered = exams.filter((exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExams(filtered);
  }, [searchQuery, exams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading exams...</p>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Exams</h1>
            <p className="text-muted-foreground mt-1">
              Upload, edit, and manage all your exams
            </p>
          </div>
          <Link href="/admin/upload-excel">
            <Button size="lg" className="w-full md:w-auto">
              <Upload className="mr-2 h-5 w-5" />
              Upload New Exam
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Exams</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalExams || 0}</p>
                </div>
                <FileSpreadsheet className="h-12 w-12 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Total Students</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalStudents || 0}</p>
                </div>
                <Users className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Avg per Exam</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalExams ? Math.round(stats.totalStudents / stats.totalExams) : 0}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search exams by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Exams List */}
      {filteredExams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No exams found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Get started by uploading your first exam'}
                </p>
                {!searchQuery && (
                  <Link href="/admin/upload-excel">
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Exam
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {exam.title}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {exam.exam_date
                          ? new Date(exam.exam_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'No date set'}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {exam.studentCount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/admin/exams/${exam.id}`} className="flex-1">
                      <Button variant="default" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/exams/${exam.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
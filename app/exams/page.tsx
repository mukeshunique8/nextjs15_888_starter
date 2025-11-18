// app/exams/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { DB_TABLES } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Calendar, Search, ChevronLeft, ChevronRight, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 9;

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [filteredExams, setFilteredExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    const loadExams = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(DB_TABLES.EXAMS)
          .select('id, title, exam_date, created_at')
          .order('exam_date', { ascending: false });

        if (error) throw error;
        
        if (!mounted) return;
        setExams(data ?? []);
        setFilteredExams(data ?? []);
        
        if (data && data.length > 0) {
          toast.success('Exams loaded successfully');
        }
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
    setCurrentPage(1);
  }, [searchQuery, exams]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Available Exams</h1>
          <p className="text-muted-foreground">
            Select an exam to check your results
          </p>
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

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-muted-foreground"
      >
        Showing {currentExams.length} of {filteredExams.length} exams
      </motion.div>

      {/* Exams Grid */}
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
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'No exams have been added yet'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {exam.title}
                        </CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {exam.exam_date
                            ? new Date(exam.exam_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'No date set'}
                        </CardDescription>
                      </div>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/exams/${exam.id}`} passHref>
                      <Button className="w-full" variant="default">
                        Check Results
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mt-8"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
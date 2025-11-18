// utils/excel.ts
import * as XLSX from 'xlsx';
import { ExamResultRow, ParsedExcelRow } from './types';
import { toNumber } from './utils';
export function parseExcelFile(file: File): Promise<ParsedExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        // Map Excel columns to our structure
        const rows: ParsedExcelRow[] = json.map((r) => ({
          student_id: String(
            r['student_id'] ?? 
            r['STUDENTID'] ?? 
            r['studentid'] ?? 
            r['Student ID'] ?? 
            ''
          ).trim(),
          
          mobile_number: String(
            r['mobile_number'] ?? 
            r['mobilenumber'] ?? 
            r['MOBILENUMBER'] ?? 
            r['mobile'] ?? 
            r['Mobile Number'] ?? 
            ''
          ).trim(),
          
          total_mark: toNumber(
            r['total_mark'] ?? 
            r['TOTAL MARK'] ?? 
            r['TOTAL_MARK'] ?? 
            r['total mark'] ?? 
            r['Total Mark']
          ),
          
          scored_mark: toNumber(
            r['scored_mark'] ?? 
            r['SCOREDMARKS'] ?? 
            r['SCOREDMAKRS'] ?? 
            r['scoredmarks'] ?? 
            r['scored mark'] ?? 
            r['Scored Mark']
          ),
          
          status: String(
            r['status'] ?? 
            r['STATUS'] ?? 
            r['Status'] ?? 
            'Pending'
          ).trim() || 'Pending'
        }));

        resolve(rows);
      } catch (err: any) {
        reject(new Error(`Failed to parse Excel file: ${err?.message ?? 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export exam results to Excel file
 */
export function exportExamAsExcel(rows: ExamResultRow[], filename = 'exam-results.xlsx') {
  try {
    // Prepare data for export (remove unnecessary fields)
    const exportData = rows.map(row => ({
      student_id: row.student_id,
      mobile_number: row.mobile_number,
      total_mark: row.total_mark ?? '',
      scored_mark: row.scored_mark ?? '',
      status: row.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // student_id
      { wch: 15 }, // mobile_number
      { wch: 12 }, // total_mark
      { wch: 12 }, // scored_mark
      { wch: 10 }  // status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Exam Results');
    XLSX.writeFile(wb, filename);
  } catch (error: any) {
    throw new Error(`Failed to export Excel: ${error?.message ?? 'Unknown error'}`);
  }
}
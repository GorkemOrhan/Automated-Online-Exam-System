import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiDownload, FiFilter, FiEye } from 'react-icons/fi';
import MainLayout from '../../../components/layout/MainLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getResults, exportResults } from '../../../api/services/results';
import { getExams } from '../../../api/services/exams';
import { getCurrentUser } from '../../../api/services/auth';

const ResultsManagement = () => {
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    examId: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const currentUser = getCurrentUser();
        
        // Check if user is admin
        if (!currentUser || !currentUser.is_admin) {
          router.push('/dashboard');
          return;
        }
        
        // Get results
        const resultsData = await getResults(filters);
        if (resultsData.success) {
          setResults(resultsData.results);
        }
        
        // Get exams for filter
        const examsData = await getExams();
        if (examsData.success) {
          setExams(examsData.exams);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router, filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };
  
  const handleExport = async (format = 'excel') => {
    setIsExporting(true);
    
    try {
      const result = await exportResults(filters, format);
      if (result.success && result.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.setAttribute('download', `exam-results-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting results:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [
      hours > 0 ? `${hours}h` : '',
      minutes > 0 ? `${minutes}m` : '',
      `${remainingSeconds}s`
    ].filter(Boolean).join(' ');
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin" className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
      </div>
      
      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-1">
                Exam
              </label>
              <select
                id="examId"
                name="examId"
                value={filters.examId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Exams</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="needs_review">Needs Review</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end mb-6 space-x-3">
        <Button
          onClick={() => handleExport('excel')}
          disabled={isExporting || results.length === 0}
          className="flex items-center"
          variant="outline"
        >
          <FiDownload className="mr-2" />
          Export to Excel
        </Button>
        <Button
          onClick={() => handleExport('pdf')}
          disabled={isExporting || results.length === 0}
          className="flex items-center"
          variant="outline"
        >
          <FiDownload className="mr-2" />
          Export to PDF
        </Button>
      </div>
      
      {isLoading ? (
        <p>Loading results...</p>
      ) : results.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed At
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{result.candidate_name}</div>
                    <div className="text-sm text-gray-500">{result.candidate_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.exam_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {result.score}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      result.status === 'passed' 
                        ? 'bg-green-100 text-green-800' 
                        : result.status === 'failed' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status === 'passed' 
                        ? 'Passed' 
                        : result.status === 'failed' 
                          ? 'Failed' 
                          : 'Needs Review'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(result.duration_seconds)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(result.completed_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/results/${result.id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiEye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <p className="text-gray-500 text-center py-8">No results found. Adjust your filters or wait for candidates to complete their exams.</p>
        </Card>
      )}
    </div>
  );
};

ResultsManagement.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default ResultsManagement; 
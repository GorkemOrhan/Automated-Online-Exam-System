import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiMail, FiExternalLink } from 'react-icons/fi';
import MainLayout from '../../../components/layout/MainLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getCandidates, deleteCandidate, resendInvitation } from '../../../api/services/candidates';
import { getCurrentUser } from '../../../api/services/auth';

const CandidateManagement = () => {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });
  
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
        
        // Get candidates
        const result = await getCandidates();
        if (result.success) {
          setCandidates(result.candidates);
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  const handleDeleteCandidate = async (candidateId) => {
    try {
      const result = await deleteCandidate(candidateId);
      if (result.success) {
        setCandidates(candidates.filter(candidate => candidate.id !== candidateId));
        setDeleteConfirm(null);
        setActionStatus({
          type: 'success',
          message: 'Candidate deleted successfully'
        });
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setActionStatus({ type: '', message: '' });
        }, 3000);
      } else {
        setActionStatus({
          type: 'error',
          message: result.message || 'Failed to delete candidate'
        });
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      setActionStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    }
  };
  
  const handleResendInvitation = async (candidateId) => {
    try {
      const result = await resendInvitation(candidateId);
      if (result.success) {
        setActionStatus({
          type: 'success',
          message: 'Invitation sent successfully'
        });
        
        // Update candidate status
        setCandidates(candidates.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, invitation_sent: true, last_invited_at: new Date().toISOString() }
            : candidate
        ));
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setActionStatus({ type: '', message: '' });
        }, 3000);
      } else {
        setActionStatus({
          type: 'error',
          message: result.message || 'Failed to send invitation'
        });
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setActionStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin" className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Management</h1>
      </div>
      
      {actionStatus.message && (
        <div className={`mb-4 p-3 rounded-md ${
          actionStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {actionStatus.message}
        </div>
      )}
      
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => router.push('/admin/candidates/create')}
          className="flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Candidate
        </Button>
      </div>
      
      {isLoading ? (
        <p>Loading candidates...</p>
      ) : candidates.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Invited
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{candidate.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{candidate.exam_title || 'Not assigned'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      candidate.has_completed 
                        ? 'bg-green-100 text-green-800' 
                        : candidate.has_started 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : candidate.invitation_sent 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {candidate.has_completed 
                        ? 'Completed' 
                        : candidate.has_started 
                          ? 'In Progress' 
                          : candidate.invitation_sent 
                            ? 'Invited' 
                            : 'Not Invited'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(candidate.last_invited_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleResendInvitation(candidate.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Send invitation"
                      >
                        <FiMail className="h-5 w-5" />
                      </button>
                      {candidate.has_completed && (
                        <button
                          onClick={() => router.push(`/admin/candidates/${candidate.id}/results`)}
                          className="text-green-600 hover:text-green-900"
                          title="View results"
                        >
                          <FiExternalLink className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/admin/candidates/${candidate.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit candidate"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(candidate.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete candidate"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <p className="text-gray-500 text-center py-8">No candidates found. Add your first candidate to get started.</p>
        </Card>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this candidate? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteCandidate(deleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CandidateManagement.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default CandidateManagement; 
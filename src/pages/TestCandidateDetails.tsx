import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCandidateDetails } from '@/services/candidateDetails';
import { Button } from '@/components/ui/button';

const TestCandidateDetails = () => {
  const [user, setUser] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      console.log('TestCandidateDetails - Current user:', user);
    });
  }, []);

  const testAPI = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('TestCandidateDetails - Starting API test...');
      
      const result = await getCandidateDetails({
        candidateIds: [101], // Test with a specific ID
        projectId: 'fe818829-39d3-42fe-8344-60f56a9600ba' // Use existing project ID
      });

      console.log('TestCandidateDetails - API result:', result);
      setTestResult(result);
    } catch (error) {
      console.error('TestCandidateDetails - API error:', error);
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Test Candidate Details API</h1>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">User Status</h2>
        <div className="p-4 bg-gray-100 rounded">
          {user ? (
            <div>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Authenticated:</strong> ✅ Yes</p>
            </div>
          ) : (
            <p>❌ Not authenticated</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">API Test</h2>
        <Button onClick={testAPI} disabled={loading || !user}>
          {loading ? 'Testing...' : 'Test API Call'}
        </Button>
        
        {testResult && (
          <div className="p-4 bg-gray-100 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <div className="p-4 bg-blue-50 rounded">
          <ol className="list-decimal list-inside space-y-1">
            <li>Make sure you are logged in (User Status should show ✅)</li>
            <li>Click "Test API Call" to test the candidate details API</li>
            <li>Check browser console for detailed logs</li>
            <li>Check the API response in the gray box below</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestCandidateDetails;
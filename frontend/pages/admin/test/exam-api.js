import { useState } from 'react';
import { Container, Paper, Typography, Button, TextField, Grid, Box, Alert, CircularProgress } from '@mui/material';
import AdminLayout from '../../../components/layout/AdminLayout';
import { getToken } from '../../../utils/auth';

export default function ExamApiTest() {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [examData, setExamData] = useState({
        title: 'Test Exam',
        description: 'This is a test exam created via the API test page',
        duration_minutes: 60,
        passing_percentage: 70,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExamData({
            ...examData,
            [name]: value
        });
    };

    const testExamCreation = async () => {
        setLoading(true);
        setResponse(null);
        setError(null);

        try {
            const token = getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Log the data being sent
            console.log('Sending exam data:', examData);
            
            const response = await fetch('http://localhost:5000/api/exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(examData)
            });

            const data = await response.json();
            console.log('Received response:', response.status, data);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${data.message || JSON.stringify(data)}`);
            }

            setResponse({
                status: response.status,
                data
            });
        } catch (err) {
            console.error('Error testing exam creation:', err);
            setError(err.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const testGetExams = async () => {
        setLoading(true);
        setResponse(null);
        setError(null);

        try {
            const token = getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const response = await fetch('http://localhost:5000/api/exams', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('Received response:', response.status, data);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${data.message || JSON.stringify(data)}`);
            }

            setResponse({
                status: response.status,
                data
            });
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError(err.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const testNoAuthEndpoint = async () => {
        setLoading(true);
        setResponse(null);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/test', {
                method: 'GET'
            });

            const data = await response.json();
            console.log('Received response:', response.status, data);

            setResponse({
                status: response.status,
                data
            });
        } catch (err) {
            console.error('Error testing no-auth endpoint:', err);
            setError(err.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Exam API Testing
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Test Exam Data
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={examData.title}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={examData.description}
                                    onChange={handleChange}
                                    margin="normal"
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Duration (minutes)"
                                    name="duration_minutes"
                                    type="number"
                                    value={examData.duration_minutes}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Passing Percentage"
                                    name="passing_percentage"
                                    type="number"
                                    value={examData.passing_percentage}
                                    onChange={handleChange}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Start Time"
                                    name="start_time"
                                    type="datetime-local"
                                    value={examData.start_time.split('.')[0]}
                                    onChange={handleChange}
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="End Time"
                                    name="end_time"
                                    type="datetime-local"
                                    value={examData.end_time.split('.')[0]}
                                    onChange={handleChange}
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            onClick={testExamCreation}
                            disabled={loading}
                            color="primary"
                        >
                            Test Create Exam
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={testGetExams}
                            disabled={loading}
                        >
                            Test Get Exams
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={testNoAuthEndpoint}
                            disabled={loading}
                            color="secondary"
                        >
                            Test No-Auth Endpoint
                        </Button>
                    </Box>

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mt: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {response && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                API Response (Status: {response.status})
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                <pre>{JSON.stringify(response.data, null, 2)}</pre>
                            </Paper>
                        </Box>
                    )}
                </Paper>
            </Container>
        </AdminLayout>
    );
} 
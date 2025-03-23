import { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, Box, Alert, CircularProgress, Grid, Chip, Divider } from '@mui/material';
import { CheckCircle, Error, Refresh } from '@mui/icons-material';
import AdminLayout from '../../../components/AdminLayout';

export default function ApiStatus() {
    const [loading, setLoading] = useState(false);
    const [endpoints, setEndpoints] = useState([
        { name: 'Backend API', url: 'http://localhost:5000/api/test', status: 'unknown' },
        { name: 'Authentication', url: 'http://localhost:5000/api/auth/validate', status: 'unknown' },
        { name: 'Exams', url: 'http://localhost:5000/api/exams', status: 'unknown' },
        { name: 'Candidates', url: 'http://localhost:5000/api/candidates', status: 'unknown' },
        { name: 'Questions', url: 'http://localhost:5000/api/questions', status: 'unknown' },
        { name: 'Results', url: 'http://localhost:5000/api/results', status: 'unknown' },
    ]);
    const [systemInfo, setSystemInfo] = useState(null);

    useEffect(() => {
        checkAllEndpoints();
        fetchSystemInfo();
    }, []);

    const fetchSystemInfo = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/test/system-info');
            if (response.ok) {
                const data = await response.json();
                setSystemInfo(data);
            }
        } catch (error) {
            console.error('Error fetching system info:', error);
        }
    };

    const checkEndpoint = async (endpoint, index) => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const startTime = Date.now();
            const response = await fetch(endpoint.url, { 
                method: 'GET',
                headers,
                // Set a timeout to prevent hanging requests
                signal: AbortSignal.timeout(5000)
            });
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            const updatedEndpoints = [...endpoints];
            updatedEndpoints[index] = {
                ...endpoint,
                status: response.ok ? 'online' : 'error',
                statusCode: response.status,
                responseTime: responseTime,
                lastChecked: new Date().toLocaleTimeString()
            };
            
            setEndpoints(updatedEndpoints);
        } catch (error) {
            console.error(`Error checking ${endpoint.name}:`, error);
            const updatedEndpoints = [...endpoints];
            updatedEndpoints[index] = {
                ...endpoint,
                status: 'offline',
                error: error.message,
                lastChecked: new Date().toLocaleTimeString()
            };
            setEndpoints(updatedEndpoints);
        }
    };

    const checkAllEndpoints = async () => {
        setLoading(true);
        try {
            await Promise.all(
                endpoints.map((endpoint, index) => checkEndpoint(endpoint, index))
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'success';
            case 'error': return 'warning';
            case 'offline': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'online': return <CheckCircle fontSize="small" />;
            case 'error':
            case 'offline': return <Error fontSize="small" />;
            default: return null;
        }
    };

    return (
        <AdminLayout>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4">
                            API Status Dashboard
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<Refresh />}
                            onClick={checkAllEndpoints}
                            disabled={loading}
                        >
                            Refresh Status
                        </Button>
                    </Box>

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    <Typography variant="h6" gutterBottom>
                        Endpoint Status
                    </Typography>
                    <Box sx={{ mb: 4 }}>
                        <Grid container spacing={2}>
                            {endpoints.map((endpoint, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Paper 
                                        elevation={1} 
                                        sx={{ 
                                            p: 2, 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            bgcolor: endpoint.status === 'offline' ? '#fff8f8' : 
                                                    endpoint.status === 'error' ? '#fffde7' : 
                                                    endpoint.status === 'online' ? '#f1f8e9' : '#ffffff'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {endpoint.name}
                                            </Typography>
                                            <Chip 
                                                label={endpoint.status} 
                                                color={getStatusColor(endpoint.status)}
                                                size="small"
                                                icon={getStatusIcon(endpoint.status)}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {endpoint.url}
                                        </Typography>
                                        {endpoint.statusCode && (
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                Status Code: {endpoint.statusCode}
                                            </Typography>
                                        )}
                                        {endpoint.responseTime && (
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                Response Time: {endpoint.responseTime}ms
                                            </Typography>
                                        )}
                                        {endpoint.error && (
                                            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                                Error: {endpoint.error}
                                            </Typography>
                                        )}
                                        {endpoint.lastChecked && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                Last checked: {endpoint.lastChecked}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                        System Information
                    </Typography>
                    {systemInfo ? (
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Paper elevation={1} sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Backend Environment
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2">
                                                <strong>Python Version:</strong> {systemInfo.python_version}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Flask Version:</strong> {systemInfo.flask_version}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Environment:</strong> {systemInfo.environment}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper elevation={1} sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Database Status
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2">
                                                <strong>Connection:</strong> {systemInfo.database?.connected ? 'Connected' : 'Disconnected'}
                                            </Typography>
                                            {systemInfo.database?.type && (
                                                <Typography variant="body2">
                                                    <strong>Type:</strong> {systemInfo.database.type}
                                                </Typography>
                                            )}
                                            {systemInfo.database?.version && (
                                                <Typography variant="body2">
                                                    <strong>Version:</strong> {systemInfo.database.version}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                                {systemInfo.stats && (
                                    <Grid item xs={12}>
                                        <Paper elevation={1} sx={{ p: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                Application Statistics
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2">
                                                            <strong>Users:</strong> {systemInfo.stats.users || 0}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2">
                                                            <strong>Exams:</strong> {systemInfo.stats.exams || 0}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2">
                                                            <strong>Candidates:</strong> {systemInfo.stats.candidates || 0}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Typography variant="body2">
                                                            <strong>Questions:</strong> {systemInfo.stats.questions || 0}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    ) : (
                        <Alert severity="info">
                            System information is not available. The /api/test/system-info endpoint may not be implemented.
                        </Alert>
                    )}
                </Paper>
            </Container>
        </AdminLayout>
    );
} 
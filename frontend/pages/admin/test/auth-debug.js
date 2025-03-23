import { useState } from 'react';
import { Container, Paper, Typography, Button, TextField, Box, Alert, CircularProgress, Divider } from '@mui/material';
import AdminLayout from '../../../components/AdminLayout';
import { login } from '../../../api/services/auth';
import { getToken, setToken, removeToken } from '../../../utils/auth';

export default function AuthDebug() {
    const [credentials, setCredentials] = useState({
        email: 'admin@example.com',
        password: 'adminpassword'
    });
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [currentToken, setCurrentToken] = useState('');

    const updateCredentials = (e) => {
        const { name, value } = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
    };

    const testLogin = async () => {
        setLoading(true);
        setResponse(null);
        setError(null);

        try {
            console.log('Attempting login with:', credentials);
            const result = await login(credentials.email, credentials.password);
            console.log('Login response:', result);
            
            if (result.success) {
                setResponse({
                    success: true,
                    message: 'Login successful',
                    data: result
                });
                // Update the current token display
                setCurrentToken(getToken());
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const testDirectLogin = async () => {
        setLoading(true);
        setResponse(null);
        setError(null);

        try {
            console.log('Attempting direct API login with:', credentials);
            
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password
                })
            });

            const data = await response.json();
            console.log('Direct login response:', response.status, data);

            if (response.ok && data.token) {
                // Manually save the token
                setToken(data.token);
                setCurrentToken(data.token);
                setResponse({
                    success: true,
                    message: 'Direct login successful',
                    data
                });
            } else {
                throw new Error(`Login failed: ${data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Direct login error:', err);
            setError(err.message || 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const clearToken = () => {
        removeToken();
        setCurrentToken('');
        setResponse({
            success: true,
            message: 'Token cleared successfully'
        });
    };

    const getCurrentToken = () => {
        const token = getToken();
        setCurrentToken(token || '');
        setResponse({
            success: !!token,
            message: token ? 'Token retrieved' : 'No token found'
        });
    };

    const decodeToken = () => {
        try {
            const token = currentToken || getToken();
            if (!token) {
                throw new Error('No token available to decode');
            }

            // Split the token and decode the payload part (second part)
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT token format');
            }

            const payload = JSON.parse(atob(parts[1]));
            console.log('Decoded token payload:', payload);
            
            setResponse({
                success: true,
                message: 'Token decoded successfully',
                data: { payload }
            });
        } catch (err) {
            console.error('Token decode error:', err);
            setError(err.message || 'Failed to decode token');
        }
    };

    return (
        <AdminLayout>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Authentication Debugging
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Login Credentials
                        </Typography>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={credentials.email}
                            onChange={updateCredentials}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={credentials.password}
                            onChange={updateCredentials}
                            margin="normal"
                        />
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button 
                                variant="contained" 
                                onClick={testLogin}
                                disabled={loading}
                            >
                                Test Normal Login
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={testDirectLogin}
                                disabled={loading}
                            >
                                Test Direct API Login
                            </Button>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Token Management
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Button 
                                variant="outlined" 
                                onClick={getCurrentToken}
                                color="primary"
                            >
                                Get Current Token
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={clearToken}
                                color="secondary"
                            >
                                Clear Token
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={decodeToken}
                                disabled={!currentToken}
                            >
                                Decode Token
                            </Button>
                        </Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={currentToken}
                            onChange={(e) => setCurrentToken(e.target.value)}
                            placeholder="JWT Token"
                            margin="normal"
                        />
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
                            <Alert severity={response.success ? "success" : "warning"}>
                                {response.message}
                            </Alert>
                            {response.data && (
                                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mt: 2 }}>
                                    <pre>{JSON.stringify(response.data, null, 2)}</pre>
                                </Paper>
                            )}
                        </Box>
                    )}
                </Paper>
            </Container>
        </AdminLayout>
    );
} 
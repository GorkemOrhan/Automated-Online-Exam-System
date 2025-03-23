import { useState, useEffect } from 'react';
import { validateToken } from '../../../api/services/auth';
import { getToken } from '../../../utils/auth';
import { Container, Paper, Typography, Button, TextField, Grid, Box, Alert } from '@mui/material';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function TokenTest() {
    const [token, setToken] = useState('');
    const [validationResult, setValidationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [manualToken, setManualToken] = useState('');

    useEffect(() => {
        // Get the token from localStorage on component mount
        const storedToken = getToken();
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const checkStoredToken = async () => {
        setLoading(true);
        try {
            const result = await validateToken(token);
            console.log('Token validation result:', result);
            setValidationResult(result);
        } catch (error) {
            console.error('Error validating token:', error);
            setValidationResult({
                valid: false,
                error: error.message || 'Unknown error occurred'
            });
        } finally {
            setLoading(false);
        }
    };

    const checkManualToken = async () => {
        setLoading(true);
        try {
            const result = await validateToken(manualToken);
            console.log('Manual token validation result:', result);
            setValidationResult(result);
        } catch (error) {
            console.error('Error validating manual token:', error);
            setValidationResult({
                valid: false,
                error: error.message || 'Unknown error occurred'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        JWT Token Debugging
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Stored Token
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            margin="normal"
                        />
                        <Button 
                            variant="contained" 
                            onClick={checkStoredToken}
                            disabled={loading || !token}
                            sx={{ mt: 2 }}
                        >
                            Validate Stored Token
                        </Button>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Manual Token Input
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={manualToken}
                            onChange={(e) => setManualToken(e.target.value)}
                            placeholder="Paste a JWT token here to validate"
                            margin="normal"
                        />
                        <Button 
                            variant="contained" 
                            onClick={checkManualToken}
                            disabled={loading || !manualToken}
                            sx={{ mt: 2 }}
                        >
                            Validate Manual Token
                        </Button>
                    </Box>

                    {validationResult && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Validation Result
                            </Typography>
                            <Alert severity={validationResult.valid ? "success" : "error"}>
                                {validationResult.valid 
                                    ? "Token is valid!" 
                                    : `Token validation failed: ${validationResult.error}`}
                            </Alert>
                            
                            {validationResult.payload && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1">Token Payload:</Typography>
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                        <pre>{JSON.stringify(validationResult.payload, null, 2)}</pre>
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    )}
                </Paper>
            </Container>
        </AdminLayout>
    );
} 
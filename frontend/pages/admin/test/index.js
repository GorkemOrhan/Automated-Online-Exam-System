import { useState } from 'react';
import { Container, Paper, Typography, Grid, Card, CardContent, CardActions, Button, Box } from '@mui/material';
import { Security, Api, AccountCircle, Token } from '@mui/icons-material';
import AdminLayout from '../../../components/layout/AdminLayout';
import Link from 'next/link';

export default function TestDashboard() {
    const debugTools = [
        {
            title: 'JWT Token Validation',
            description: 'Validate JWT tokens, view token payloads, and test token expiration',
            icon: <Token fontSize="large" color="secondary" />,
            link: '/admin/test/token'
        },
        {
            title: 'API Status Check',
            description: 'View system information and check API availability',
            icon: <AccountCircle fontSize="large" color="success" />,
            link: '/admin/test/status'
        }
    ];

    return (
        <AdminLayout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Developer Testing Dashboard
                    </Typography>
                    <Typography variant="body1" paragraph>
                        This area contains tools for testing and debugging various aspects of the application.
                        Use these tools to diagnose issues with authentication, API endpoints, and data validation.
                    </Typography>

                    <Box sx={{ mt: 4 }}>
                        <Grid container spacing={3}>
                            {debugTools.map((tool, index) => (
                                <Grid item xs={12} sm={6} md={6} key={index}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                                            {tool.icon}
                                        </Box>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" component="h2" gutterBottom>
                                                {tool.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {tool.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Link href={tool.link} passHref>
                                                <Button size="small" component="a" fullWidth>
                                                    Open Tool
                                                </Button>
                                            </Link>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Note for Developers
                        </Typography>
                        <Typography variant="body2">
                            These tools are intended for development and debugging purposes only.
                            The information exposed here should not be shared publicly.
                            If you discover any issues, please document them with screenshots and relevant error messages.
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </AdminLayout>
    );
} 
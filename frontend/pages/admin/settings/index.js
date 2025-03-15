import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import MainLayout from '../../../components/layout/MainLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getSystemSettings, updateSystemSettings } from '../../../api/services/admin';
import { getCurrentUser } from '../../../api/services/auth';

const SettingsPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'Online Exam System',
    admin_email: '',
    notification_email: '',
    allow_registration: true,
    default_passing_score: 70,
    default_time_limit: 60,
    enable_email_notifications: true,
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const currentUser = getCurrentUser();
        
        // Check if user is admin
        if (!currentUser || !currentUser.is_admin) {
          router.push('/dashboard');
          return;
        }
        
        // Get settings
        const result = await getSystemSettings();
        if (result.success) {
          setSettings({
            ...settings,
            ...result.settings,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load settings. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [router]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const result = await updateSystemSettings(settings);
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Settings updated successfully',
        });
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to update settings',
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/admin" className="mr-4">
          <FiArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      </div>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {isLoading ? (
        <p>Loading settings...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* General Settings */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      id="site_name"
                      name="site_name"
                      value={settings.site_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      id="admin_email"
                      name="admin_email"
                      value={settings.admin_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notification_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Notification Email
                    </label>
                    <input
                      type="email"
                      id="notification_email"
                      name="notification_email"
                      value={settings.notification_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email address where notifications and results will be sent
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center h-full">
                      <input
                        type="checkbox"
                        id="allow_registration"
                        name="allow_registration"
                        checked={settings.allow_registration}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                      <label htmlFor="allow_registration" className="ml-2 block text-sm text-gray-700">
                        Allow user registration
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Exam Default Settings */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Exam Default Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="default_passing_score" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Passing Score (%)
                    </label>
                    <input
                      type="number"
                      id="default_passing_score"
                      name="default_passing_score"
                      value={settings.default_passing_score}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="default_time_limit" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      id="default_time_limit"
                      name="default_time_limit"
                      value={settings.default_time_limit}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Email Settings */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h2>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable_email_notifications"
                      name="enable_email_notifications"
                      checked={settings.enable_email_notifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    />
                    <label htmlFor="enable_email_notifications" className="ml-2 block text-sm text-gray-700">
                      Enable email notifications
                    </label>
                  </div>
                </div>
                
                {settings.enable_email_notifications && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="smtp_host" className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        id="smtp_host"
                        name="smtp_host"
                        value={settings.smtp_host}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="smtp_port" className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        id="smtp_port"
                        name="smtp_port"
                        value={settings.smtp_port}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="smtp_username" className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        id="smtp_username"
                        name="smtp_username"
                        value={settings.smtp_username}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="smtp_password" className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        id="smtp_password"
                        name="smtp_password"
                        value={settings.smtp_password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="smtp_from_email" className="block text-sm font-medium text-gray-700 mb-1">
                        From Email
                      </label>
                      <input
                        type="email"
                        id="smtp_from_email"
                        name="smtp_from_email"
                        value={settings.smtp_from_email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="smtp_from_name" className="block text-sm font-medium text-gray-700 mb-1">
                        From Name
                      </label>
                      <input
                        type="text"
                        id="smtp_from_name"
                        name="smtp_from_name"
                        value={settings.smtp_from_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="flex items-center"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <FiSave className="mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

SettingsPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default SettingsPage; 
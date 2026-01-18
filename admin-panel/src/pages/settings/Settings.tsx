// admin-panel/src/pages/settings/Settings.tsx
import { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Users,
  Shield,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore, type AuthState } from '@/store/authStore';
import api from '@/services/api';
import { getInitials } from '@/utils';

const Settings = () => {
  const { admin } = useAuthStore() as AuthState;
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderNotifications: true,
    customerNotifications: false,
    productNotifications: true,
    lowStockAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    marketingEmails: false,
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await api.put('/admin/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await api.put('/admin/auth/notification-preferences', notifications);
      setMessage({ type: 'success', text: 'Notification preferences saved!' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save preferences',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Alert Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Profile</CardTitle>
              <CardDescription>
                Your account information and role details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {getInitials(admin?.name || 'Admin')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{admin?.name}</h3>
                  <p className="text-sm text-muted-foreground">{admin?.email}</p>
                  <Badge variant="default" className="mt-2">
                    <Shield className="mr-1 h-3 w-3" />
                    Administrator
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Profile Details (Read-only) */}
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={admin?.name || ''} disabled className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support to change your name
                  </p>
                </div>

                <div>
                  <Label>Email Address</Label>
                  <Input value={admin?.email || ''} disabled className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support to change your email
                  </p>
                </div>

                <div>
                  <Label>Role</Label>
                  <Input value="Administrator" disabled className="mt-1" />
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {admin?.permissions?.includes('all') ? (
                      <Badge variant="default">Full Access</Badge>
                    ) : (
                      admin?.permissions?.map((perm) => (
                        <Badge key={perm} variant="secondary">
                          {perm}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Management Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Management
                <Badge variant="outline">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Manage admin users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Staff Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add team members, assign roles, and manage permissions. This feature will
                  allow you to:
                </p>
                <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-1">
                  <li>• Create staff accounts with custom permissions</li>
                  <li>• Assign role-based access (Orders, Products, Customers)</li>
                  <li>• Track staff activity and login history</li>
                  <li>• Set up approval workflows</li>
                </ul>
                <Button variant="outline" className="mt-4" disabled>
                  Enable Staff Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label>Current Password *</Label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>New Password *</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    required
                    minLength={6}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    At least 6 characters
                  </p>
                </div>

                <div>
                  <Label>Confirm New Password *</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <Button type="submit" disabled={saving}>
                  <Lock className="mr-2 h-4 w-4" />
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Two-Factor Authentication
                <Badge variant="outline">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Two-factor authentication (2FA) adds an extra layer of security by
                  requiring a verification code in addition to your password.
                </p>
                <Button variant="outline" disabled>
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Current Session</div>
                    <div className="text-sm text-muted-foreground">
                      {navigator.userAgent.includes('Chrome')
                        ? 'Chrome Browser'
                        : navigator.userAgent.includes('Firefox')
                          ? 'Firefox Browser'
                          : navigator.userAgent.includes('Safari')
                            ? 'Safari Browser'
                            : 'Web Browser'}{' '}
                      • Active now
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure which email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive all email notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Order Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Orders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new orders are placed
                    </p>
                  </div>
                  <Switch
                    checked={notifications.orderNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, orderNotifications: checked }))
                    }
                    disabled={!notifications.emailNotifications}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Customer Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Customers</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when customers sign up
                    </p>
                  </div>
                  <Switch
                    checked={notifications.customerNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        customerNotifications: checked,
                      }))
                    }
                    disabled={!notifications.emailNotifications}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Inventory Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Product Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Product changes and new additions
                    </p>
                  </div>
                  <Switch
                    checked={notifications.productNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        productNotifications: checked,
                      }))
                    }
                    disabled={!notifications.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerted when products are low in stock
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lowStockAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, lowStockAlerts: checked }))
                    }
                    disabled={!notifications.emailNotifications}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Reports</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily sales and performance reports
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dailyReports}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, dailyReports: checked }))
                    }
                    disabled={!notifications.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly summary reports
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, weeklyReports: checked }))
                    }
                    disabled={!notifications.emailNotifications}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive tips, updates, and promotional content
                  </p>
                </div>
                <Switch
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, marketingEmails: checked }))
                  }
                  disabled={!notifications.emailNotifications}
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Platform and environment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Platform Version</span>
              <span className="text-sm font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Environment</span>
              <Badge variant="default">Production</Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">API Status</span>
              <Badge variant="default">
                <CheckCircle className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-sm text-muted-foreground">Last Login</span>
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
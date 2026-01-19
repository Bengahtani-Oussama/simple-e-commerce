// admin-panel/src/pages/settings/Settings.tsx
import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Bell,
  Users,
  Shield,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

  // Staff Management State
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    permissions: [] as string[],
  });

  // Available permissions
  const availablePermissions = [
    { id: 'manage_users', label: 'Manage Users', description: 'Create and manage staff accounts' },
    { id: 'manage_products', label: 'Manage Products', description: 'Add, edit, and delete products' },
    { id: 'manage_orders', label: 'Manage Orders', description: 'Process and manage customer orders' },
    { id: 'manage_coupons', label: 'Manage Coupons', description: 'Create and manage discount coupons' },
    { id: 'manage_brands', label: 'Manage Brands', description: 'Add and manage product brands' },
    { id: 'manage_categories', label: 'Manage Categories', description: 'Organize products by categories' },
    { id: 'view_reports', label: 'View Reports', description: 'Access sales and performance reports' },
    { id: 'manage_settings', label: 'Manage Settings', description: 'Configure system settings' },
  ];

  // Role permissions mapping
  const rolePermissions: { [key: string]: string[] } = {
    super_admin: ['manage_users', 'manage_products', 'manage_orders', 'manage_coupons', 'manage_brands', 'manage_categories', 'view_reports', 'manage_settings'],
    manager: ['manage_products', 'manage_orders', 'manage_coupons', 'manage_brands', 'manage_categories', 'view_reports'],
    staff: ['manage_orders', 'view_reports'],
    viewer: ['view_reports']
  };

  // Load staff members
  const loadStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/staff');
      setStaff(response.data.data);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load staff members',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = (role: string) => {
    setStaffForm(prev => ({
      ...prev,
      role,
      permissions: rolePermissions[role] || []
    }));
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setStaffForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Create staff member
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.post('/admin/staff', staffForm);
      setMessage({ type: 'success', text: 'Staff member created successfully!' });
      setStaffForm({ name: '', email: '', password: '', role: 'staff', permissions: [] });
      setShowCreateForm(false);
      loadStaff();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create staff member',
      });
    } finally {
      setSaving(false);
    }
  };

  // Update staff member
  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setSaving(true);
    setMessage(null);

    try {
      await api.put(`/admin/staff/${editingStaff._id}`, {
        name: staffForm.name,
        email: staffForm.email,
        role: staffForm.role,
        permissions: staffForm.permissions,
        isActive: editingStaff.isActive
      });
      setMessage({ type: 'success', text: 'Staff member updated successfully!' });
      setEditingStaff(null);
      setStaffForm({ name: '', email: '', password: '', role: 'staff', permissions: [] });
      loadStaff();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update staff member',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete staff member
  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    setSaving(true);
    setMessage(null);

    try {
      await api.delete(`/admin/staff/${staffId}`);
      setMessage({ type: 'success', text: 'Staff member deleted successfully!' });
      loadStaff();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete staff member',
      });
    } finally {
      setSaving(false);
    }
  };

  // Start editing
  const startEditing = (staffMember: any) => {
    setEditingStaff(staffMember);
    setStaffForm({
      name: staffMember.name,
      email: staffMember.email,
      password: '',
      role: staffMember.role,
      permissions: staffMember.permissions || []
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingStaff(null);
    setStaffForm({ name: '', email: '', password: '', role: 'staff', permissions: [] });
  };

  // Load staff on component mount
  useEffect(() => {
    if (activeTab === 'profile') {
      loadStaff();
    }
  }, [activeTab]);

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

          {/* Staff Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Management
                  </CardTitle>
                  <CardDescription>
                    Manage admin users and their permissions
                  </CardDescription>
                </div>
                <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                      <DialogDescription>
                        Create a new staff account with custom permissions
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateStaff} className="space-y-6">
                      <div className="grid gap-4">
                        <div>
                          <Label>Full Name *</Label>
                          <Input
                            value={staffForm.name}
                            onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Email Address *</Label>
                          <Input
                            type="email"
                            value={staffForm.email}
                            onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Password *</Label>
                          <Input
                            type="password"
                            value={staffForm.password}
                            onChange={(e) => setStaffForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                            minLength={6}
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            At least 6 characters
                          </p>
                        </div>

                        <div>
                          <Label>Role *</Label>
                          <Select value={staffForm.role} onValueChange={handleRoleChange}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Roles automatically assign default permissions
                          </p>
                        </div>

                        <div>
                          <Label>Permissions</Label>
                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                            {availablePermissions.map((permission) => (
                              <div key={permission.id} className="flex items-start space-x-2">
                                <Checkbox
                                  id={permission.id}
                                  checked={staffForm.permissions.includes(permission.id)}
                                  onCheckedChange={() => handlePermissionToggle(permission.id)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <Label
                                    htmlFor={permission.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {permission.label}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCreateForm(false);
                            setStaffForm({ name: '', email: '', password: '', role: 'staff', permissions: [] });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? 'Creating...' : 'Create Staff'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading staff members...</p>
                </div>
              ) : staff.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Staff Members</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started by adding your first staff member
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((member) => (
                        <TableRow key={member._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              member.role === 'super_admin' ? 'default' :
                              member.role === 'manager' ? 'secondary' :
                              member.role === 'staff' ? 'outline' : 'outline'
                            }>
                              {member.role === 'super_admin' ? 'Super Admin' :
                               member.role === 'manager' ? 'Manager' :
                               member.role === 'staff' ? 'Staff' : 'Viewer'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.isActive ? 'default' : 'secondary'}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {member.permissions?.slice(0, 2).map((perm: string) => (
                                <Badge key={perm} variant="outline" className="text-xs">
                                  {availablePermissions.find(p => p.id === perm)?.label || perm}
                                </Badge>
                              ))}
                              {member.permissions?.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.permissions.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => startEditing(member)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteStaff(member._id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Staff Dialog */}
          <Dialog open={!!editingStaff} onOpenChange={(open) => !open && cancelEditing()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
                <DialogDescription>
                  Update staff member information and permissions
                </DialogDescription>
              </DialogHeader>
              {editingStaff && (
                <form onSubmit={handleUpdateStaff} className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={staffForm.name}
                        onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Email Address *</Label>
                      <Input
                        type="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Role *</Label>
                      <Select value={staffForm.role} onValueChange={handleRoleChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Roles automatically assign default permissions
                      </p>
                    </div>

                    <div>
                      <Label>Permissions</Label>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {availablePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`edit-${permission.id}`}
                              checked={staffForm.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor={`edit-${permission.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permission.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Updating...' : 'Update Staff'}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
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
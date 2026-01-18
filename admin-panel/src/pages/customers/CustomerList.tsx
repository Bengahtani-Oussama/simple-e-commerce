// admin-panel/src/pages/customers/CustomerList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  MoreHorizontal,
  UserCheck,
  UserX,
  Edit,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import api from '@/services/api';
import {
  formatPrice,
  formatDate,
  debounce,
  downloadCSV,
  getInitials,
} from '@/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  totalSpent: number;
  totalOrders: number;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  verifiedCustomers: number;
}

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    verifiedCustomers: 0,
  });

  // Selection state
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate'>('activate');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [minSpent, setMinSpent] = useState('');
  const [maxSpent, setMaxSpent] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, verifiedFilter, minSpent, maxSpent, dateFrom, dateTo, page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };

      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (verifiedFilter !== 'all') params.status = verifiedFilter;
      if (minSpent) params.minSpent = minSpent;
      if (maxSpent) params.maxSpent = maxSpent;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;

      const response = await api.get('/admin/customers', { params });
      setCustomers(response.data.data || []);
      setTotal(response.data.total || 0);

      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setVerifiedFilter('all');
    setMinSpent('');
    setMaxSpent('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c) => c._id));
    }
  };

  const toggleSelectCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Bulk actions
  const handleBulkAction = async () => {
    try {
      await api.put('/admin/customers/bulk/toggle-status', {
        customerIds: selectedCustomers,
        isActive: bulkAction === 'activate',
      });

      alert(`${selectedCustomers.length} customers ${bulkAction}d successfully!`);
      setSelectedCustomers([]);
      setBulkActionDialogOpen(false);
      fetchCustomers();
    } catch (error: any) {
      console.error('Bulk action failed:', error);
      alert(error.response?.data?.message || 'Failed to update customers');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const exportData = customers.map((customer) => ({
      'First Name': customer.firstName,
      'Last Name': customer.lastName,
      Email: customer.email,
      Phone: customer.phone || 'N/A',
      'Join Date': formatDate(customer.createdAt),
      'Total Orders': customer.totalOrders,
      'Total Spent': customer.totalSpent,
      Status: customer.isActive ? 'Active' : 'Inactive',
      Verified: customer.isVerified ? 'Yes' : 'No',
    }));

    downloadCSV(
      exportData,
      `customers-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  // Email customer
  const handleEmailCustomer = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-muted-foreground">
            Manage customer accounts ({total} customers)
          </p>
        </div>
        <div className="flex gap-2">
          {selectedCustomers.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkAction('activate');
                  setBulkActionDialogOpen(true);
                }}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Activate ({selectedCustomers.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkAction('deactivate');
                  setBulkActionDialogOpen(true);
                }}
              >
                <UserX className="mr-2 h-4 w-4" />
                Deactivate ({selectedCustomers.length})
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Customers</CardTitle>
            <Badge variant="default" className="h-4">✓</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.verifiedCustomers / stats.totalCustomers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  defaultValue={search}
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Verified Filter */}
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            {/* Spending Range */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min spent"
                value={minSpent}
                onChange={(e) => setMinSpent(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max spent"
                value={maxSpent}
                onChange={(e) => setMaxSpent(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>

          {(search ||
            statusFilter !== 'all' ||
            verifiedFilter !== 'all' ||
            minSpent ||
            maxSpent ||
            dateFrom ||
            dateTo) && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      customers.length > 0 &&
                      selectedCustomers.length === customers.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCustomers.includes(customer._id)}
                        onCheckedChange={() => toggleSelectCustomer(customer._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(`${customer.firstName} ${customer.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {customer.isVerified && (
                              <Badge variant="outline" className="h-4 px-1 text-[10px]">
                                ✓
                              </Badge>
                            )}
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{customer.phone || 'N/A'}</div>
                    </TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{customer.totalOrders} orders</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatPrice(customer.totalSpent)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigate(`/customers/${customer._id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEmailCustomer(customer.email)}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await api.put(`/admin/customers/${customer._id}/toggle-status`);
                                fetchCustomers();
                              } catch (error) {
                                console.error('Failed to toggle status:', error);
                              }
                            }}
                          >
                            {customer.isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No customers found</p>
                    {(search || statusFilter !== 'all') && (
                      <Button variant="link" onClick={clearFilters} className="mt-2">
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
            {total} customers
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === 'activate' ? 'Activate' : 'Deactivate'} Customers?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkAction} {selectedCustomers.length} selected
              customers? This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkAction}>
              {bulkAction === 'activate' ? 'Activate' : 'Deactivate'} Customers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerList;
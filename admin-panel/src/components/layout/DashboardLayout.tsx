import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Tag,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore, type AuthState } from '@/store/authStore';
import { cn } from '@/utils';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore() as AuthState;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: FolderTree,
    },
    {
      name: 'Brands',
      href: '/brands',
      icon: Tag,
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const NavLinks = () => (
    <nav className="space-y-1 px-2">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href || 
          (item.href !== '/' && location.pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/40 lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg">Admin Panel</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <NavLinks />
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {admin?.name.substring(0, 2).toUpperCase() || 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
          {/* Mobile Menu */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <Package className="h-6 w-6 text-primary" />
                  <span className="text-lg">Admin Panel</span>
                </Link>
              </div>
              <ScrollArea className="flex-1 py-4">
                <NavLinks />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Page Title - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold">
              {navigation.find((item) => 
                location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href))
              )?.name || 'Dashboard'}
            </h1>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {admin?.name.substring(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{admin?.name || 'Admin'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{admin?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
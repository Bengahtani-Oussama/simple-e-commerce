import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
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
  Ticket,
  Blocks,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore, type AuthState } from "@/store/authStore";
import { cn } from "@/utils";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore() as AuthState;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setSidebarCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Blocks,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: FolderTree,
    },
    {
      name: "Brands",
      href: "/brands",
      icon: Tag,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingCart,
    },
    {
      name: "Coupons",
      href: "/coupons",
      icon: Ticket,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const NavLinks = ({ collapsed }: { collapsed: boolean }) => (
    <nav className="space-y-1 px-2">
      {navigation.map((item) => {
        const isActive =
          location.pathname === item.href ||
          (item.href !== "/" && location.pathname.startsWith(item.href));

        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center" : "gap-3",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r bg-muted/40 transition-all duration-300 lg:flex",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            {!sidebarCollapsed && <span className="text-lg">Admin Panel</span>}
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <NavLinks collapsed={sidebarCollapsed} />
        </ScrollArea>
        <div className="border-t p-4">
          <div
            className={cn(
              "flex items-center rounded-lg bg-accent/50 p-3",
              sidebarCollapsed ? "justify-center" : "gap-3",
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {admin?.name.substring(0, 2).toUpperCase() || "AD"}
              </AvatarFallback>
            </Avatar>

            {!sidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {admin?.name || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {admin?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="relative flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6 z-10">
          {/* Mobile Menu */}

          <Button
            variant="outline"
            size="icon"
            className="w-6 h-6 hidden lg:inline-flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 rounded-full"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
          >
            {sidebarCollapsed ? (
              <ArrowRight className="h-5 w-5" />
            ) : (
              <ArrowRight className="h-5 w-5 scale-x-[-1]" />
            )}
          </Button>

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
                <NavLinks collapsed={false} />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Page Title - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold">
              {navigation.find(
                (item) =>
                  location.pathname === item.href ||
                  (item.href !== "/" &&
                    location.pathname.startsWith(item.href)),
              )?.name || "Dashboard"}
            </h1>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {admin?.name.substring(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">
                  {admin?.name || "Admin"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {admin?.email}
                  </p>
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

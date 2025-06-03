import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Package,
  ShoppingBag,
  Settings,
  Store,
  DollarSign,
  ChevronRight,
  BarChart,
  Bell,
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/api/users";
import { UserType } from "@/api/users";
import { useTranslation } from "react-i18next";

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const navItems = [
    {
      title: t("navigation.customers"),
      href: "/customers",
      icon: Users,
      roles: ["admin", "branch_staff"]
    },
    {
      title: t("navigation.orders"),
      href: "/orders",
      icon: Package,
      roles: ["admin", "branch_staff", "technician"]
    },
    {
      title: t("navigation.catalog"),
      href: "/catalog",
      icon: ShoppingBag,
      roles: ["admin", "branch_staff"]
    },
    {
      title: t("navigation.accounting"),
      href: "/accounting",
      icon: DollarSign,
      roles: ["admin", "branch_staff"]
    },
    {
      title: t("navigation.reports"),
      href: "/reports",
      icon: BarChart,
      roles: ["admin"]
    },
    {
      title: t("navigation.branches"),
      href: "/branches",
      icon: Store,
      roles: ["admin"]
    },
    {
      title: t("navigation.users"),
      href: "/users",
      icon: Users,
      roles: ["admin"]
    },
    {
      title: t("navigation.settings"),
      href: "/settings",
      icon: Settings,
      roles: ["admin"]
    }
  ];

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[220px] flex-col border-r bg-background pt-16">
      <div className="flex-1 overflow-auto p-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            // Check if user has permission to see this nav item
            if (!user || (item.roles && !item.roles.includes(user.role))) {
              return null;
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t">
        {user && (
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1">
              <Users className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("auth.logout")}
        </Button>
      </div>
    </aside>
  );
}
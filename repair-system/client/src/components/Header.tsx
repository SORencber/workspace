import { Bell, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { useState, useEffect } from "react";
import { UserType } from "@/api/users";
import { getCurrentUser } from "@/api/users";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Header() {
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

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              RepairOS
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              3
            </span>
          </Button>
          <ThemeToggle />
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10">
                {user.role === 'admin' ? t('users.roles.admin') : 
                 user.role === 'branch_staff' ? t('users.roles.branch_staff') : 
                 t('users.roles.technician')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
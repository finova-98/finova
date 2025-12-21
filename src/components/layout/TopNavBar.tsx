import { Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface TopNavBarProps {
  title: string;
  showMenu?: boolean;
  showProfile?: boolean;
  onMenuClick?: () => void;
}

export function TopNavBar({ 
  title, 
  showMenu = true, 
  showProfile = true,
  onMenuClick 
}: TopNavBarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left - Menu */}
        <div className="w-10">
          {showMenu && (
            <Button 
              variant="icon" 
              size="icon-sm" 
              onClick={onMenuClick}
              className="text-foreground/70 hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center - Title */}
        <h1 className="text-base font-semibold text-foreground">
          {title}
        </h1>

        {/* Right - Profile */}
        <div className="w-10">
          {showProfile && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="icon" 
                  size="icon-sm"
                  className="text-foreground/70 hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user.user_metadata?.full_name || 'Account'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
          {showProfile && (
            <Button 
              variant="icon" 
              size="icon-sm"
              onClick={() => navigate('/auth')}
              className="text-foreground/70 hover:text-foreground"
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Film,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './DropdownMenu';
import { Avatar, AvatarFallback } from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="sticky top-0 z-40 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-primary-600 group-hover:bg-primary-500 transition-colors"
            >
              <Film className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-white tracking-tight">
              WatchMate
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <Avatar>
                    <AvatarFallback className="bg-primary-600 text-white text-sm font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-gray-200 text-sm font-medium">
                    {user?.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuItem onSelect={() => {}}>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {}}>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} destructive>
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
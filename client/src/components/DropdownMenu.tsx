import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface DropdownMenuProps {
  children: ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <AnimatePresence>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            asChild
            forceMount
            sideOffset={8}
          >
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn(
                'min-w-[180px] bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-1.5 z-50',
                'overflow-hidden'
              )}
            >
              {children}
            </motion.div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </AnimatePresence>
    </DropdownMenuPrimitive.Root>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
  destructive?: boolean;
}

export function DropdownMenuItem({
  children,
  onSelect,
  className,
  destructive,
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      onSelect={onSelect}
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm cursor-pointer',
        'outline-none select-none transition-colors',
        destructive
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-gray-200 hover:bg-gray-700',
        className
      )}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
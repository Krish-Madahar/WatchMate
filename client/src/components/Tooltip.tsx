import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  sideOffset = 6,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            asChild
            side={side}
            sideOffset={sideOffset}
            forceMount
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.1 }}
              className={cn(
                'px-3 py-1.5 rounded-lg bg-gray-700 text-gray-100 text-sm',
                'shadow-lg border border-gray-600 z-50'
              )}
            >
              {content}
              <TooltipPrimitive.Arrow className="fill-gray-700" />
            </motion.div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
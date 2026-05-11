import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface SkeletonCardProps {
  className?: string;
}

export default function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('bg-gray-800 rounded-lg overflow-hidden', className)}
    >
      <div className="aspect-[2/3] relative">
        <div className="absolute inset-0 shimmer" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 rounded shimmer" />
        <div className="h-4 w-1/2 rounded shimmer" />
      </div>
    </motion.div>
  );
}
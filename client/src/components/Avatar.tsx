import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../lib/utils';

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
}

export function Avatar({ children, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
    >
      {children}
    </AvatarPrimitive.Root>
  );
}

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export function AvatarImage({ src, alt, className }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      src={src}
      alt={alt}
      className={cn('aspect-square h-full w-full object-cover', className)}
    />
  );
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-gray-700 text-sm font-medium',
        className
      )}
    >
      {children}
    </AvatarPrimitive.Fallback>
  );
}
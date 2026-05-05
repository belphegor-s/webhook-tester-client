import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700',
    outline: 'bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white',
    ghost: 'bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
    danger: 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };

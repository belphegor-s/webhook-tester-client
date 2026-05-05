import { cn } from '../../lib/utils';

const Card = ({ className, ...props }) => (
  <div className={cn('rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-100 shadow-xl backdrop-blur-sm', className)} {...props} />
);

const CardHeader = ({ className, ...props }) => <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;

const CardTitle = ({ className, ...props }) => <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;

const CardDescription = ({ className, ...props }) => <p className={cn('text-sm text-zinc-400', className)} {...props} />;

const CardContent = ({ className, ...props }) => <div className={cn('p-6 pt-0', className)} {...props} />;

const CardFooter = ({ className, ...props }) => <div className={cn('flex items-center p-6 pt-0', className)} {...props} />;

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

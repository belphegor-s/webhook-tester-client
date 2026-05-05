import { cn } from '../../lib/utils';

const Container = ({ children, className }) => {
  return <div className={cn('mx-auto px-4 py-8 max-w-6xl relative', className)}>{children}</div>;
};

export { Container };

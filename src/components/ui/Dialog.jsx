import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const DialogHeader = ({ className, ...props }) => <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)} {...props} />;

const DialogTitle = ({ className, ...props }) => <h2 className={cn('text-lg font-semibold leading-none tracking-tight text-white', className)} {...props} />;

const DialogDescription = ({ className, ...props }) => <p className={cn('text-sm text-zinc-400', className)} {...props} />;

const DialogFooter = ({ className, ...props }) => <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6', className)} {...props} />;

export { Dialog, DialogHeader, DialogFooter, DialogTitle, DialogDescription };

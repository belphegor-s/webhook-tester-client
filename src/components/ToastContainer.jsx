import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const spring = {
  type: 'spring',
  damping: 20,
  stiffness: 180,
};

const ToastContainer = ({ toasts }) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm pointer-events-none flex flex-col-reverse items-center">
      <AnimatePresence initial={false}>
        {[...toasts].slice(-5).map((toast, index) => {
          const depth = index;
          const scale = 1 - depth * 0.04;
          const blur = depth === 0 ? 'blur-0' : 'blur-[1px]';
          const opacity = depth === 0 ? 'opacity-100' : 'opacity-70';
          const translateY = depth * -8;
          const zIndex = 100 - depth;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: translateY, scale }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={spring}
              className={clsx(
                'absolute pointer-events-auto px-4 py-3 rounded-xl shadow-xl grid grid-cols-[auto_1fr] items-center gap-3 backdrop-blur-md bg-opacity-60 border text-white',
                blur,
                opacity,
                toast.type === 'success' ? 'bg-green-500/40 border-green-400/40' : toast.type === 'error' ? 'bg-red-500/40 border-red-400/40' : 'bg-blue-500/40 border-blue-400/40'
              )}
              style={{
                transformOrigin: 'bottom center',
                zIndex,
              }}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-white" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-white" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-white" />}
              <span className="font-medium text-sm">{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

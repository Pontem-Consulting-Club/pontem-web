'use client';

import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
} from 'framer-motion';
import { createPortal } from 'react-dom';
import { XIcon } from 'lucide-react';

const DialogContext = React.createContext(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

function DialogProvider({ children, transition }) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();
  const triggerRef = useRef(null);

  const contextValue = useMemo(
    () => ({ isOpen, setIsOpen, uniqueId, triggerRef }), 
    [isOpen, uniqueId]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </DialogContext.Provider>
  );
}

function Dialog({ children, transition }) {
  return (
    <DialogProvider transition={transition}>
      {children}
    </DialogProvider>
  );
}

function DialogTrigger({
  children,
  className,
  style,
  triggerRef,
}) {
  const { setIsOpen, isOpen, uniqueId } = useDialog();

  const handleClick = useCallback((event) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen]
  );

  return (
    <motion.div
      ref={triggerRef}
      layoutId={`dialog-${uniqueId}`}
      className={`${className} ${isOpen ? 'hidden' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={style}
      role='button'
      aria-haspopup='dialog'
      aria-expanded={isOpen}
      aria-controls={`dialog-content-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

function DialogContent({ children, className, style }) {
  const { uniqueId } = useDialog();
  const containerRef = useRef(null);

  return (
    <motion.div
      ref={containerRef}
      className={`dialog-content ${className}`}
      style={style}
      role='dialog'
      aria-modal='true'
      aria-labelledby={`dialog-title-${uniqueId}`}
      aria-describedby={`dialog-description-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

function DialogContainer({ children }) {
  const { isOpen, setIsOpen, uniqueId } = useDialog();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key={`backdrop-${uniqueId}`}
            className='dialog-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
          <motion.div
            className='dialog-container'
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{ marginTop: '42px' }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function DialogTitle({ children, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
      layout
    >
      {children}
    </motion.div>
  );
}

function DialogSubtitle({ children, className, style }) {
  return (
    <motion.div
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function DialogDescription({
  children,
  className,
  variants,
  disableLayoutAnimation,
}) {
  const { uniqueId } = useDialog();

  return (
    <motion.div
      key={`dialog-description-${uniqueId}`}
      layoutId={
        disableLayoutAnimation
          ? undefined
          : `dialog-description-content-${uniqueId}`
      }
      variants={variants}
      className={className}
      initial='initial'
      animate='animate'
      exit='exit'
      id={`dialog-description-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

function DialogImage({ src, alt, className, style }) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      style={style}
    />
  );
}

function DialogClose({ children, className, variants }) {
  const { setIsOpen, uniqueId } = useDialog();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <motion.button
      onClick={handleClose}
      type='button'
      aria-label='Close dialog'
      key={`dialog-close-${uniqueId}`}
      className={`absolute right-6 top-6 ${className}`}
      initial='initial'
      animate='animate'
      exit='exit'
      variants={variants}
    >
      {children || <XIcon size={24} />}
    </motion.button>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContainer,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogSubtitle,
  DialogDescription,
  DialogImage,
};
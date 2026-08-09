import React, { useEffect } from 'react';
import { useSecurity } from '../../application/context/SecurityContext';

export const DevToolsBlocker: React.FC = () => {
  const { isDevToolsBlocked } = useSecurity();

  useEffect(() => {
    if (!isDevToolsBlocked) return;

    // 1. Prevent Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
      }
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
      }
      // Ctrl+Shift+C / Cmd+Option+C (Inspect Element Mode)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }
      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // 3. Debugger Trap
    let intervalId: ReturnType<typeof setInterval>;
    const trap = () => {
      // eslint-disable-next-line no-debugger
      debugger;
    };
    
    intervalId = setInterval(() => {
      trap();
    }, 100);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalId);
    };
  }, [isDevToolsBlocked]);

  return null;
};

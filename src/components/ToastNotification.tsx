import React from 'react';
import { X, Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.js';
import { useLanguage } from '../context/LanguageContext.js';

export const ToastNotification: React.FC = () => {
  const { activeToast, dismissToast } = useNotifications();
  const { lang } = useLanguage();

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 end-4 sm:end-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom duration-300 pointer-events-auto">
      <div className="p-4 rounded-2xl bg-slate-900/95 border-2 border-emerald-500 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg shrink-0">
            {activeToast.type === 'GOAL' ? '⚽' : '📢'}
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate">
              {lang === 'ar' ? activeToast.titleAr : activeToast.title}
            </h4>
            <p className="text-xs text-slate-300 leading-tight">
              {lang === 'ar' ? activeToast.messageAr : activeToast.message}
            </p>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

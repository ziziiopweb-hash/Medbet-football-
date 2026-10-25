import React from 'react';
import { Bell, X, Volume2, VolumeX, Trash2, CheckCheck, PlayCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { getRelativeTime } from '../utils/dateUtils.js';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const {
    notifications,
    soundEnabled,
    toggleSound,
    markAllAsRead,
    clearNotifications,
    triggerNotification,
  } = useNotifications();

  if (!isOpen) return null;

  const handleTestNotification = () => {
    triggerNotification({
      matchId: 'm-ucl-1',
      type: 'GOAL',
      title: 'GOAL! Vinícius Júnior scores a stunner!',
      titleAr: 'هدف عالمي! فينيسيوس جونيور يسجل لريال مدريد!',
      message: 'Real Madrid vs Manchester City',
      messageAr: 'ريال مدريد ضد مانشستر سيتي',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">{t('notificationsTitle')}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={soundEnabled ? t('soundOn') : t('soundOff')}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleTestNotification}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 transition-colors font-medium cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('testGoalNotification')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>قراءة الكل</span>
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={clearNotifications}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {t('noNotifications')}
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3 rounded-2xl border transition-colors ${
                  notif.isRead
                    ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                    : 'bg-slate-950/90 border-emerald-500/30 text-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-base mt-0.5">
                      {notif.type === 'GOAL' ? '⚽' : '📢'}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-white truncate">
                        {lang === 'ar' ? notif.titleAr : notif.title}
                      </div>
                      <div className="text-xs text-slate-300">
                        {lang === 'ar' ? notif.messageAr : notif.message}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {getRelativeTime(notif.timestamp, lang)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

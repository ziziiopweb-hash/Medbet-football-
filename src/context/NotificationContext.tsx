import React, { createContext, useContext, useState, useEffect } from 'react';
import { MatchNotification } from '../types/football.js';
import { soundEffects } from '../utils/soundUtils.js';

interface NotificationContextType {
  notifications: MatchNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  triggerNotification: (notif: Omit<MatchNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  activeToast: MatchNotification | null;
  dismissToast: () => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  soundEnabled: true,
  toggleSound: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  triggerNotification: () => {},
  activeToast: null,
  dismissToast: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<MatchNotification[]>(() => {
    try {
      const saved = localStorage.getItem('medbet_notifications');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'n-init-1',
              matchId: 'm-ucl-1',
              type: 'GOAL',
              title: 'GOAL! Kylian Mbappé (Real Madrid)',
              titleAr: 'هدف! كيليان مبابي (ريال مدريد)',
              message: 'Real Madrid 2 - 1 Manchester City (63\')',
              messageAr: 'ريال مدريد 2 - 1 مانشستر سيتي (الدقيقة 63)',
              timestamp: new Date().toISOString(),
              isRead: false,
            },
            {
              id: 'n-init-2',
              matchId: 'm-epl-1',
              type: 'LINEUP',
              title: 'Official Lineups Confirmed: Arsenal vs Liverpool',
              titleAr: 'التشكيلتان الرسميتان: أرسنال ضد ليفربول',
              message: 'Saka and Salah start as captains.',
              messageAr: 'ساكا وصلاح يبدآن المباراة أساسيين.',
              timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
              isRead: true,
            },
          ];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('medbet_sound_pref');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [activeToast, setActiveToast] = useState<MatchNotification | null>(null);

  useEffect(() => {
    localStorage.setItem('medbet_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('medbet_sound_pref', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const triggerNotification = (notif: Omit<MatchNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: MatchNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);

    if (soundEnabled) {
      if (notif.type === 'GOAL') {
        soundEffects.playGoalCelebration();
      } else {
        soundEffects.playWhistle();
      }
    }

    // Auto-dismiss toast after 6 seconds
    setTimeout(() => {
      setActiveToast(current => (current?.id === newNotif.id ? null : current));
    }, 6000);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        toggleSound,
        markAllAsRead,
        clearNotifications,
        triggerNotification,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

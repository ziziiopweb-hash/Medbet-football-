import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const DICTIONARY: Record<string, { ar: string; en: string }> = {
  // App brand & navigation
  appName: { ar: 'Medbet Football', en: 'Medbet Football' },
  appTagline: { ar: 'مركز المباريات المباشرة والتحليلات', en: 'Live Match Center & Pro Analytics' },
  matchesTab: { ar: 'المباريات', en: 'Matches' },
  standingsTab: { ar: 'الترتيب', en: 'Standings' },
  newsTab: { ar: 'الأخبار', en: 'News' },
  scorersTab: { ar: 'الهدافون', en: 'Top Scorers' },
  betsTab: { ar: 'القسيمة الافتراضية', en: 'Virtual Slip' },
  coverageTab: { ar: 'نطاق التغطية', en: 'Coverage & Scope' },

  // Match status
  statusAll: { ar: 'الكل', en: 'All' },
  statusLive: { ar: 'مباشر', en: 'Live' },
  statusFinished: { ar: 'انتهت', en: 'Finished' },
  statusUpcoming: { ar: 'قادمة', en: 'Upcoming' },
  statusHt: { ar: 'استراحة', en: 'HT' },
  fullTime: { ar: 'نهاية المباراة', en: 'Full Time' },

  // Match Center tabs
  tabSummary: { ar: 'أحداث المباراة', en: 'Timeline' },
  tabLineups: { ar: 'التشكيلة التكتيكية', en: 'Tactical Lineups' },
  tabStats: { ar: 'الإحصائيات', en: 'Match Stats' },
  tabH2h: { ar: 'المواجهات السابقة', en: 'H2H' },
  tabAnalytics: { ar: 'التحليلات والتوقعات', en: 'Data Analytics' },
  tabMatchNews: { ar: 'أخبار اللقاء', en: 'Match News' },

  // Tactical Lineups
  officialLineup: { ar: 'تشكيلة رسمية', en: 'Official Lineup' },
  predictedLineup: { ar: 'تشكيلة متوقعة', en: 'Predicted Lineup' },
  manager: { ar: 'المدرب الفني', en: 'Manager' },
  referee: { ar: 'حكم المباراة', en: 'Referee' },
  stadium: { ar: 'الملعب', en: 'Stadium' },
  substitutes: { ar: 'دكة البدلاء', en: 'Substitutes' },

  // Stats
  possession: { ar: 'الاستحواذ', en: 'Ball Possession' },
  shotsTotal: { ar: 'إجمالي التسديدات', en: 'Total Shots' },
  shotsOnTarget: { ar: 'تسديدات على المرمى', en: 'Shots on Target' },
  expectedGoals: { ar: 'الأهداف المتوقعة (xG)', en: 'Expected Goals (xG)' },
  corners: { ar: 'الركنيات', en: 'Corner Kicks' },
  fouls: { ar: 'الأخطاء', en: 'Fouls' },
  yellowCards: { ar: 'البطاقات الصفراء', en: 'Yellow Cards' },
  redCards: { ar: 'البطاقات الحمراء', en: 'Red Cards' },
  passAccuracy: { ar: 'دقة التمرير', en: 'Pass Accuracy' },
  bigChances: { ar: 'الفرص المحققة', en: 'Big Chances Created' },
  saves: { ar: 'تصديات الحارس', en: 'Goalkeeper Saves' },

  // Predictions
  predictionsTitle: { ar: 'التحليلات الرياضية ونماذج التوقع', en: 'Probabilistic Predictive Analytics' },
  predictionsDisclaimer: {
    ar: 'تنويه: هذه توقعات احتمالية رياضية مبنية على خوارزميات تحليل البيانات والأداء ومعدلات xG، وليست نتائج مؤكدة أو تشجيعاً على المقامرة الحقيقية.',
    en: 'Disclaimer: These are probabilistic mathematical models based on form, xG, and statistical performance, not confirmed outcomes.',
  },
  winProbability: { ar: 'احتمالات النتيجة', en: 'Result Probabilities' },
  bothTeamsScore: { ar: 'تسجيل كلا الفريقين', en: 'Both Teams to Score (BTTS)' },
  over25Goals: { ar: 'أكثر من 2.5 هدف', en: 'Over 2.5 Goals' },
  confidence: { ar: 'مستوى الثقة في النموذج', en: 'Model Confidence' },
  keyFactors: { ar: 'العوامل الإحصائية المؤثرة', en: 'Key Statistical Factors' },

  // Virtual Slip
  betSlipTitle: { ar: 'قسيمة الرهان الافتراضية', en: 'Virtual Bet Slip' },
  singleBet: { ar: 'فردية (Single)', en: 'Single Bet' },
  accBet: { ar: 'تراكمية (Accumulator)', en: 'Accumulator Multi' },
  selections: { ar: 'الخيارات المحددة', en: 'Selections' },
  stake: { ar: 'الرهان الافتراضي (MedCoins)', en: 'Virtual Stake (MedCoins)' },
  totalOdds: { ar: 'المضاعف الإجمالي (Odds)', en: 'Total Multiplier (Odds)' },
  potentialReturn: { ar: 'العائد الافتراضي المتوقع', en: 'Potential Payout' },
  placeBet: { ar: 'تأكيد القسيمة الافتراضية', en: 'Place Virtual Slip' },
  clearSlip: { ar: 'مسح القسيمة', en: 'Clear Slip' },
  myBets: { ar: 'قسائمي المحفوظة', en: 'My Saved Slips' },
  openSlips: { ar: 'قيد الانتظار', en: 'Open / Pending' },
  settledSlips: { ar: 'القسائم المنتهية', en: 'Settled' },
  virtualBalance: { ar: 'الرصيد الافتراضي', en: 'Virtual Balance' },
  resetBalance: { ar: 'إعادة شحن الرصيد الافتراضي', en: 'Reload Virtual Credits' },
  emptySlip: { ar: 'قسيمتك فارغة حالياً. اضغط على أي احتمال (1 أو X أو 2) لإضافته.', en: 'Your slip is empty. Click any outcome (1, X, or 2) to add it.' },
  winRate: { ar: 'نسبة النجاح', en: 'Win Rate' },
  totalProfit: { ar: 'صافي الأرباح الافتراضية', en: 'Net Virtual Profit' },

  // Notifications
  notificationsTitle: { ar: 'تنبيهات المباريات', en: 'Match Alerts' },
  soundOn: { ar: 'الصوت مفعّل', en: 'Sound On' },
  soundOff: { ar: 'الصوت مكتوم', en: 'Sound Muted' },
  testGoalNotification: { ar: 'تجربة تنبيه هدف مباشر', en: 'Simulate Live Goal Alert' },
  noNotifications: { ar: 'لا توجد تنبيهات جديدة حالياً.', en: 'No notifications at this time.' },

  // Favorites
  favoritesTitle: { ar: 'المفضلة والمتابعة', en: 'Favorites' },
  followMatch: { ar: 'متابعة المباراة', en: 'Follow Match' },
  unfollowMatch: { ar: 'إلغاء المتابعة', en: 'Unfollow' },

  // General & Timezone
  localTimezone: { ar: 'التوقيت المحلي', en: 'Local Timezone' },
  refreshData: { ar: 'تحديث البيانات', en: 'Refresh Data' },
  searchPlaceholder: { ar: 'ابحث عن فريق، دوري، أو مباراة...', en: 'Search team, league, match...' },
  dataUpdatedNow: { ar: 'محدث الآن عبر الاتصال المباشر', en: 'Live Real-Time Data Active' },
  source: { ar: 'المصدر', en: 'Source' },
  readFull: { ar: 'قراءة التقرير الكامل', en: 'Read Full Story' },
};

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  setLang: () => {},
  isRtl: true,
  t: (k: string) => k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medbet_lang');
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'ar'; // Default Arabic
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('medbet_lang', newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (key: string): string => {
    const item = DICTIONARY[key];
    if (!item) return key;
    return item[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRtl: lang === 'ar', t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

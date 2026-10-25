import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Clock, Globe, Zap, Server } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { getUserTimeZone } from '../utils/dateUtils.js';

interface CoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoverageModal: React.FC<CoverageModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const [coverageData, setCoverageData] = useState<any>(null);
  const userTz = getUserTimeZone();

  useEffect(() => {
    if (isOpen) {
      fetch('/api/football/coverage')
        .then(res => res.json())
        .then(data => {
          if (data.success) setCoverageData(data.data);
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/medbet_app_icon_1792621468976.jpg"
              alt="Medbet Football"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg shadow-sm border border-emerald-500/40 object-cover"
            />
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {lang === 'ar' ? 'نطاق التغطية وموثوقية البيانات' : 'Data Coverage & Engine Reliability'}
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                MEDBET FOOTBALL PRO
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Status Card */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              حالة المحرك الرياضي
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              نشط ومباشر (ONLINE)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              دورة التحديث التلقائي
            </span>
            <span className="font-mono text-slate-200">كل 15 ثانية لمباريات المباشر</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              منطقتك الزمنية المكتشفة
            </span>
            <span className="font-mono font-semibold text-emerald-400">{userTz}</span>
          </div>
        </div>

        {/* Covered Competitions */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-300">البطولات المغطاة بالكامل:</h4>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
              <span>🇪🇺</span>
              <span>دوري أبطال أوروبا (UCL)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
              <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
              <span>الدوري الإنجليزي الممتاز</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
              <span>🇪🇸</span>
              <span>الدوري الإسباني (La Liga)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
              <span>🇮🇹</span>
              <span>الدوري الإيطالي (Serie A)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
              <span>🇩🇪</span>
              <span>الدوري الألماني (Bundesliga)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
              <span>🇸🇦</span>
              <span>دوري روشن السعودي (SPL)</span>
            </div>
          </div>
        </div>

        {/* Data Integrity Commitment */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-slate-300 space-y-1.5">
          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ضمان الشفافية وفصل التوقعات عن النتائج المؤكدة:
          </div>
          <p className="leading-relaxed text-slate-400">
            يتم فصل النتائج الرسمية الموثقة عن التوقعات الاحتمالية الرياضية بشكل تام. النماذج التحليلية مبنية على معايير رياضية وإحصائية دقيقة (xG، سجل المواجهات H2H، ومعدل الأهداف)، دون أي تضليل أو اختلاق عشوائي للنتائج.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          فهمت ذلك
        </button>
      </div>
    </div>
  );
};

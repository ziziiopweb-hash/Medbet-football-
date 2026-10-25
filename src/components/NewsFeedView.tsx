import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, Tag } from 'lucide-react';
import { NewsArticle } from '../types/football.js';
import { useLanguage } from '../context/LanguageContext.js';
import { getRelativeTime } from '../utils/dateUtils.js';

export const NewsFeedView: React.FC = () => {
  const { lang, t } = useLanguage();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const [activeLeague, setActiveLeague] = useState<string>('epl');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/football/news?league=${activeLeague}`);
        const data = await res.json();
        if (data.success) {
          setArticles(data.data);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [activeLeague]);

  const newsLeagues = [
    { id: 'epl', name: 'Premier League', nameAr: 'الدوري الإنجليزي' },
    { id: 'ucl', name: 'Champions League', nameAr: 'دوري الأبطال' },
    { id: 'laliga', name: 'La Liga', nameAr: 'الدوري الإسباني' },
    { id: 'spl', name: 'Saudi Pro League', nameAr: 'دوري روشن' },
    { id: 'seriea', name: 'Serie A', nameAr: 'الدوري الإيطالي' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-emerald-400" />
            <span>{t('newsTab')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            أحدث التقارير والمؤتمرات الصحفية الصادرة عن كبرى الوكالات الرياضية العالمية
          </p>
        </div>

        {/* League Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {newsLeagues.map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLeague(l.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeLeague === l.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? l.nameAr : l.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs font-mono">
          جاري تحميل الأخبار والمصادر...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map(article => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="group bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={article.imageUrl}
                  alt={lang === 'ar' ? article.titleAr : article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 start-2.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-slate-800">
                  {lang === 'ar' ? article.categoryAr : article.category}
                </div>
              </div>

              {/* Text content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{article.source}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {getRelativeTime(article.publishedAt, lang)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {lang === 'ar' ? article.titleAr : article.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {lang === 'ar' ? article.summaryAr : article.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span>{t('readFull')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-semibold">
                {selectedArticle.source}
              </span>
              <span>{getRelativeTime(selectedArticle.publishedAt, lang)}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {lang === 'ar' ? selectedArticle.titleAr : selectedArticle.title}
            </h2>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={selectedArticle.imageUrl}
                alt="article"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {lang === 'ar' ? selectedArticle.summaryAr : selectedArticle.summary}
            </p>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

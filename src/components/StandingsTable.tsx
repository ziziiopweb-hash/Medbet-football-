import React, { useState, useEffect } from 'react';
import { Trophy, Target, Award } from 'lucide-react';
import { StandingRow, TopScorer } from '../types/football.js';
import { useLanguage } from '../context/LanguageContext.js';

export const StandingsTable: React.FC = () => {
  const { lang, t } = useLanguage();
  const [activeLeague, setActiveLeague] = useState<string>('epl');
  const [activeSubTab, setActiveSubTab] = useState<'standings' | 'scorers'>('standings');
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [standingsRes, scorersRes] = await Promise.all([
          fetch(`/api/football/standings?league=${activeLeague}`),
          fetch('/api/football/top-scorers'),
        ]);

        const standingsData = await standingsRes.json();
        const scorersData = await scorersRes.json();

        if (standingsData.success) setStandings(standingsData.data);
        if (scorersData.success) setScorers(scorersData.data);
      } catch (err) {
        console.error('Error fetching standings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeLeague]);

  const leagueOptions = [
    { id: 'epl', name: 'Premier League', nameAr: 'الدوري الإنجليزي', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'laliga', name: 'La Liga', nameAr: 'الدوري الإسباني', flag: '🇪🇸' },
    { id: 'spl', name: 'Roshn Saudi League', nameAr: 'دوري روشن السعودي', flag: '🇸🇦' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* League Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {leagueOptions.map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLeague(l.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                activeLeague === l.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <span>{l.flag}</span>
              <span>{lang === 'ar' ? l.nameAr : l.name}</span>
            </button>
          ))}
        </div>

        {/* Sub-tab: Standings vs Scorers */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('standings')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'standings'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('standingsTab')}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('scorers')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'scorers'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('scorersTab')}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs font-mono">
          جاري تحميل بيانات الدوري... / Loading league data...
        </div>
      ) : activeSubTab === 'standings' ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-12">#</th>
                  <th className="py-3 px-4">الفريق / Club</th>
                  <th className="py-3 px-3 text-center">لعب / P</th>
                  <th className="py-3 px-3 text-center">فاز / W</th>
                  <th className="py-3 px-3 text-center">تعادل / D</th>
                  <th className="py-3 px-3 text-center">خسر / L</th>
                  <th className="py-3 px-3 text-center hidden sm:table-cell">له / GF</th>
                  <th className="py-3 px-3 text-center hidden sm:table-cell">عليه / GA</th>
                  <th className="py-3 px-3 text-center">الفارق / GD</th>
                  <th className="py-3 px-4 text-center font-bold text-white">النقاط / PTS</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">آخر 5 مباريات / Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {standings.map(row => {
                  const isTop4 = row.position <= 4;
                  return (
                    <tr
                      key={row.position}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold mx-auto text-xs ${
                            isTop4
                              ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.position}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-100">
                          {lang === 'ar' ? row.team.nameAr : row.team.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                        {row.played}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-300">{row.won}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-300">{row.drawn}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-300">{row.lost}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.goalsFor}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.goalsAgainst}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-emerald-400">
                        {row.points}
                      </td>
                      <td className="py-3.5 px-4 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {row.form.map((f, i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                f === 'W'
                                  ? 'bg-emerald-500 text-slate-950'
                                  : f === 'D'
                                  ? 'bg-slate-700 text-slate-200'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Top Scorers Leaderboard */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scorers.map(sc => (
            <div
              key={sc.rank}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-sm text-emerald-400">
                  #{sc.rank}
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {lang === 'ar' ? sc.player.nameAr : sc.player.name}
                  </h4>
                  <p className="text-slate-400 text-xs">
                    {lang === 'ar' ? sc.team.nameAr : sc.team.name} · {sc.player.nationality}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">مباريات</div>
                  <div className="text-slate-300 font-semibold">{sc.matchesPlayed}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">صناعة</div>
                  <div className="text-slate-300 font-semibold">{sc.assists}</div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40">
                  <div className="text-[10px] text-emerald-400 uppercase font-bold">أهداف</div>
                  <div className="text-lg font-black text-white">{sc.goals}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

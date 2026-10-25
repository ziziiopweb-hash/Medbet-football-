import React, { useState } from 'react';
import {
  X,
  Trash2,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronUp,
  Percent,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useVirtualBet } from '../context/VirtualBetContext.js';

interface VirtualBetSlipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualBetSlipDrawer: React.FC<VirtualBetSlipDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { lang, t } = useLanguage();
  const {
    balance,
    selections,
    betType,
    setBetType,
    stake,
    setStake,
    removeSelection,
    clearSelections,
    totalOdds,
    potentialReturn,
    placeBet,
    myBets,
    settleBet,
    resetBankroll,
    stats,
  } = useVirtualBet();

  const [activeTab, setActiveTab] = useState<'slip' | 'history'>('slip');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'OPEN' | 'SETTLED'>('ALL');

  if (!isOpen) return null;

  const quickStakes = [25, 50, 100, 250];

  const handlePlace = () => {
    const success = placeBet();
    if (success) {
      setActiveTab('history');
    }
  };

  const filteredHistory = myBets.filter(b => {
    if (historyFilter === 'OPEN') return b.status === 'OPEN';
    if (historyFilter === 'SETTLED') return b.status !== 'OPEN';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-s border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">{t('betSlipTitle')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bankroll Pill & Sub-tabs */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{t('virtualBalance')}:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {balance.toLocaleString()} MC
            </span>
          </div>

          <button
            onClick={resetBankroll}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            title={t('resetBalance')}
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>{t('resetBalance')}</span>
          </button>
        </div>

        {/* Tab switchers: Slip vs My Bets */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('slip')}
            className={`py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'slip'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{t('selections')}</span>
            {selections.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {selections.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{t('myBets')}</span>
            <span className="text-slate-500 font-mono text-[10px]">({myBets.length})</span>
          </button>
        </div>

        {/* TAB 1: Current Slip */}
        {activeTab === 'slip' && (
          <div className="flex-1 overflow-y-auto flex flex-col justify-between p-4 space-y-4">
            
            {selections.length === 0 ? (
              <div className="my-auto text-center py-12 px-4 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/60 mx-auto flex items-center justify-center text-slate-500">
                  <Coins className="w-6 h-6" />
                </div>
                <p className="text-xs leading-relaxed text-slate-400">{t('emptySlip')}</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {/* Single vs Accumulator toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setBetType('single')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        betType === 'single'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t('singleBet')}
                    </button>
                    <button
                      onClick={() => setBetType('accumulator')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        betType === 'accumulator'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t('accBet')}
                    </button>
                  </div>

                  <button
                    onClick={clearSelections}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('clearSlip')}</span>
                  </button>
                </div>

                {/* Selection items list */}
                <div className="space-y-2">
                  {selections.map(sel => (
                    <div
                      key={sel.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 flex-1 pe-2">
                        <div className="text-[11px] text-slate-400 truncate">
                          {lang === 'ar' ? sel.matchTitleAr : sel.matchTitle}
                        </div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span className="text-emerald-400">
                            {lang === 'ar' ? sel.selectionLabelAr : sel.selectionLabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-sm text-emerald-400 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                          {sel.odds.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeSelection(sel.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stake Controls */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{t('stake')}:</span>
                    <span className="font-mono font-bold text-white">{stake} MC</span>
                  </div>

                  {/* Quick stake buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {quickStakes.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setStake(amount)}
                        className={`py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                          stake === amount
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>

                  {/* Summary Totals */}
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>{t('totalOdds')}:</span>
                      <span className="font-mono font-bold text-white">{totalOdds.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>{t('potentialReturn')}:</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {potentialReturn.toLocaleString()} MC
                      </span>
                    </div>
                  </div>

                  {/* Place Bet Action Button */}
                  <button
                    onClick={handlePlace}
                    disabled={stake > balance || selections.length === 0}
                    className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t('placeBet')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: My Saved Bets History */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Bankroll KPI Strip */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-xs">
              <div>
                <div className="text-[10px] text-slate-400">{t('winRate')}</div>
                <div className="font-mono font-bold text-white text-sm">{stats.winRate}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">{t('totalProfit')}</div>
                <div
                  className={`font-mono font-bold text-sm ${
                    stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {stats.netProfit > 0 ? `+${stats.netProfit}` : stats.netProfit} MC
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">إجمالي الرهانات</div>
                <div className="font-mono font-bold text-slate-300 text-sm">{stats.totalBets}</div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setHistoryFilter('ALL')}
                className={`flex-1 py-1 rounded text-center font-medium cursor-pointer ${
                  historyFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setHistoryFilter('OPEN')}
                className={`flex-1 py-1 rounded text-center font-medium cursor-pointer ${
                  historyFilter === 'OPEN' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                {t('openSlips')}
              </button>
              <button
                onClick={() => setHistoryFilter('SETTLED')}
                className={`flex-1 py-1 rounded text-center font-medium cursor-pointer ${
                  historyFilter === 'SETTLED' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                {t('settledSlips')}
              </button>
            </div>

            {/* Bet Cards */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                لا توجد قسائم مسجلة في هذا القسم.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map(bet => {
                  const isWon = bet.status === 'WON';
                  const isLost = bet.status === 'LOST';
                  const isOpen = bet.status === 'OPEN';

                  return (
                    <div
                      key={bet.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {bet.type === 'accumulator' ? t('accBet') : t('singleBet')}
                        </span>
                        
                        {/* Status Badge */}
                        {isWon && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> رابحة
                          </span>
                        )}
                        {isLost && (
                          <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-400 font-bold text-[10px] flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> خاسرة
                          </span>
                        )}
                        {isOpen && (
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-400 font-bold text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> قيد المتابعة
                          </span>
                        )}
                      </div>

                      {/* Selections inside this bet */}
                      <div className="space-y-1 py-1 border-y border-slate-800/60">
                        {bet.selections.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 truncate max-w-[200px]">
                              {lang === 'ar' ? s.matchTitleAr : s.matchTitle}
                            </span>
                            <span className="text-emerald-400 font-mono font-semibold">
                              {lang === 'ar' ? s.selectionLabelAr : s.selectionLabel} @
                              {s.odds.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Financial info */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div>
                          الرهان: <strong className="text-white font-mono">{bet.stake} MC</strong>
                        </div>
                        <div>
                          العائد:{' '}
                          <strong className="text-emerald-400 font-mono">
                            {bet.potentialReturn} MC
                          </strong>
                        </div>
                      </div>

                      {/* Testing simulation settle actions on Open slips */}
                      {isOpen && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2 text-[10px]">
                          <span className="text-slate-500">اختبار النتيجة:</span>
                          <button
                            onClick={() => settleBet(bet.id, 'WON')}
                            className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold hover:bg-emerald-900 cursor-pointer"
                          >
                            حسم بالربح ✓
                          </button>
                          <button
                            onClick={() => settleBet(bet.id, 'LOST')}
                            className="px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300 font-semibold hover:bg-red-900 cursor-pointer"
                          >
                            حسم بالخسارة ✕
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

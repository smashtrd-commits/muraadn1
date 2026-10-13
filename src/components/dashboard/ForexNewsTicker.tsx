import React, { useEffect, useState } from 'react';
import { Globe, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ForexNewsItem } from '../../types';

export const ForexNewsTicker: React.FC = () => {
  const [news, setNews] = useState<ForexNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        if (data.news && Array.isArray(data.news)) {
          setNews(data.news);
          setLastUpdated(new Date().toLocaleTimeString('so-SO', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (e) {
      console.warn('Could not fetch live forex news:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="rounded-[22px] p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Wararka Suuqa Forex (Live News & Google Search)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            </h3>
            <p className="text-[11px] text-slate-500">
              Wararka dhaqaalaha ee saamaynta ku leh suuqyada caalamka
            </p>
          </div>
        </div>

        <button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          title="Dib u cusboonaysii"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          <span className="hidden sm:inline">Cusboonaysii</span>
        </button>
      </div>

      {/* News list cards */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
        {news.length === 0 && !loading ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Warar hadda lama helin. Riix badhanka cusboonaysii.
          </p>
        ) : (
          news.map((item) => {
            const isHigh = item.impact === 'high';
            const isBullish = item.sentiment === 'bullish';
            const isBearish = item.sentiment === 'bearish';

            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex flex-col gap-1.5 hover:shadow-xs transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 text-[11px] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900">
                      {item.pair}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isHigh
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isHigh ? 'Saamayn Sare (High)' : 'Saamayn Dhexe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    {isBullish ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> Bullish
                      </span>
                    ) : isBearish ? (
                      <span className="text-rose-600 font-bold flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" /> Bearish
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-0.5">
                        <Minus className="w-3 h-3" /> Dhex-dhexaad
                      </span>
                    )}
                    <span>• {item.time}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            );
          })
        )}
      </div>

      {lastUpdated && (
        <p className="text-[10px] text-slate-400 text-right">
          Warkii ugu dambeeyay: {lastUpdated}
        </p>
      )}
    </div>
  );
};

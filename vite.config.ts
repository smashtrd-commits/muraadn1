import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { GoogleGenAI } from '@google/genai';

function forexNewsPlugin(): Plugin {
  let cachedNews: any[] | null = null;
  let lastFetchTime = 0;
  let isQuotaExhausted = false;
  let quotaExhaustedTime = 0;
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  const QUOTA_BACKOFF_TTL = 60 * 60 * 1000; // 60 minutes backoff on quota limit

  return {
    name: 'forex-news-plugin',
    configureServer(server) {
      server.middlewares.use('/api/news', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        res.setHeader('Content-Type', 'application/json');

        const fallbackNews = [
          {
            id: '1',
            title: 'US CPI & Fed Interest Rate Outlook: Dollar holds key pivot',
            impact: 'high',
            sentiment: 'neutral',
            pair: 'EURUSD / DXY',
            summary: 'Federal Reserve rate expectations keep US Dollar hovering around crucial resistance as core inflation data approaches.',
            time: '12m ka hor'
          },
          {
            id: '2',
            title: 'Gold (XAUUSD) stabilizes near historic highs amid central bank purchases',
            impact: 'high',
            sentiment: 'bullish',
            pair: 'XAUUSD',
            summary: 'Dahabka wuxuu ilaashanayaa heerar sare iyadoo dalabka bangiyada dhexe iyo hubanti la\'aanta juqraafi-siyaasadeed ay sii xoogaysanayaan.',
            time: '35m ka hor'
          },
          {
            id: '3',
            title: 'ECB hints at potential interest rate policy easing as growth cools',
            impact: 'medium',
            sentiment: 'bearish',
            pair: 'EURUSD',
            summary: 'Bangiga Dhexe ee Yurub (ECB) wuxuu ka digayaa hoos u dhaca dhaqaalaha gobolka Euro-da.',
            time: '1h ka hor'
          },
          {
            id: '4',
            title: 'Bank of England maintains cautious stance on Sterling (GBP)',
            impact: 'medium',
            sentiment: 'neutral',
            pair: 'GBPUSD',
            summary: 'BoE ayaa ku celisay in sicir-bararku u baahan yahay xakameyn joogto ah ka hor inta aan la dhimin dulsaarka.',
            time: '2h ka hor'
          },
          {
            id: '5',
            title: 'Nasdaq 100 & Tech stocks show volatility ahead of earnings',
            impact: 'high',
            sentiment: 'bullish',
            pair: 'NAS100',
            summary: 'Indices-ka Mareykanka gaar ahaan NAS100 waxay muujinayaan lulasho heer sare ah iyadoo shirkadaha tiknoolajiyaddu soo saarayaan natiijooyinkooda.',
            time: '3h ka hor'
          }
        ];

        const now = Date.now();

        // 1. Return memory-cached news if fresh
        if (cachedNews && now - lastFetchTime < CACHE_TTL) {
          res.end(JSON.stringify({ news: cachedNews, source: 'cache' }));
          return;
        }

        // 2. If quota is exhausted and within backoff window, immediately return fallback
        if (isQuotaExhausted && now - quotaExhaustedTime < QUOTA_BACKOFF_TTL) {
          res.end(JSON.stringify({ news: cachedNews || fallbackNews, source: 'quota_fallback' }));
          return;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          res.end(JSON.stringify({ news: fallbackNews, source: 'cached' }));
          return;
        }

        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: 'List 5 breaking Forex & global macroeconomic news headlines today with high trading impact for pairs like EURUSD, GBPUSD, XAUUSD, NAS100. Return ONLY valid JSON array without markdown formatting. Each item must have: id (string), title (string in English/Somali), impact ("high"|"medium"|"low"), sentiment ("bullish"|"bearish"|"neutral"), pair (string), summary (short sentence in Somali: max 15 words), time (e.g. "15m ka hor").',
            config: {
              tools: [{ googleSearch: {} }],
            },
          });

          const text = response.text || '';
          const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          try {
            const parsed = JSON.parse(cleanedText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              cachedNews = parsed;
              lastFetchTime = now;
              isQuotaExhausted = false;
              res.end(JSON.stringify({ news: parsed, source: 'live_google_search' }));
              return;
            }
          } catch {
            // fallback if JSON parsing failed
          }

          cachedNews = fallbackNews;
          lastFetchTime = now;
          res.end(JSON.stringify({ news: fallbackNews, source: 'fallback' }));
        } catch (error: any) {
          const errMsg = error?.message || String(error);
          if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
            isQuotaExhausted = true;
            quotaExhaustedTime = now;
            console.warn('Gemini API rate limit reached, gracefully serving forex economic news.');
          } else {
            console.warn('Could not refresh live news headlines, serving cached news.');
          }
          cachedNews = fallbackNews;
          lastFetchTime = now;
          res.end(JSON.stringify({ news: fallbackNews, source: 'fallback' }));
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      forexNewsPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'muraadn1 - Forex Journal & Miisaaniyad',
          short_name: 'muraadn1',
          description: 'Diiwaanka ganacsiga Forex iyo maaraynta miisaaniyadda shakhsiga ee hal ganacsade.',
          theme_color: '#2563eb',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

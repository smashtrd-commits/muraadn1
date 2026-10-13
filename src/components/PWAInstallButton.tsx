import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Android / Chrome / Edge flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition active:scale-95 cursor-pointer"
        title="Ku shub taleefankaaga ama kombiyuutarkaaga"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Ku shub App-ka</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 border border-blue-500/30 transition active:scale-95 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Ku shub iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ku shubitaanka iPhone / iPad
              </h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                1. Taabo badhanka <strong>Share (Wadaag)</strong> ee hoose Safari.<br />
                2. Hoos u deg oo dooro <strong>Ku dar Shaashadda Hore (Add to Home Screen)</strong>.<br />
                3. Taabo <strong>Add</strong> si aad app-ka ugu isticmaasho sidii barnaamij taleefan oo caadi ah.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Waan fahmay (Xidh)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

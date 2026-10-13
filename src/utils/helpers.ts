import jsPDF from 'jspdf';
import { Account, Trade, Transaction, UserSettings } from '../types';

/**
 * Compress an image file or blob client-side to maximum 900px dimension and JPEG format.
 */
export async function compressImage(fileOrBlob: Blob | File, maxWidth = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Format currency in Somali / international format ($1,234.56 or -$120.00)
 */
export function formatCurrency(amount: number | null | undefined, showPlus = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  const isNegative = amount < 0;
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (isNegative) return `-$${abs}`;
  if (showPlus && amount > 0) return `+$${abs}`;
  return `$${abs}`;
}

/**
 * Render privacy masked dots or value
 */
export function renderPrivacyAmount(amount: number | null | undefined, isHidden: boolean, showPlus = false): string {
  if (isHidden) return '••••••';
  return formatCurrency(amount, showPlus);
}

/**
 * Calculate RR ratio string
 */
export function calculateRR(entry?: number | null, sl?: number | null, tp?: number | null): string | null {
  if (entry == null || sl == null || tp == null || isNaN(entry) || isNaN(sl) || isNaN(tp)) return null;
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return null;
  const ratio = (reward / risk).toFixed(1);
  return `RR 1:${ratio}`;
}

/**
 * Calculate win rate according to formula:
 * win rate = wins / (closed trades - breakeven)
 */
export function calculateWinRate(trades: Trade[]): {
  winRate: number;
  wins: number;
  losses: number;
  breakevens: number;
  totalClosed: number;
} {
  const closed = trades.filter((t) => t.result !== 'open');
  const wins = closed.filter((t) => t.result === 'win').length;
  const losses = closed.filter((t) => t.result === 'loss').length;
  const breakevens = closed.filter((t) => t.result === 'breakeven').length;

  const validDenominator = closed.length - breakevens;
  const winRate = validDenominator > 0 ? (wins / validDenominator) * 100 : 0;

  return {
    winRate: Math.round(winRate * 10) / 10,
    wins,
    losses,
    breakevens,
    totalClosed: closed.length,
  };
}

/**
 * Calculate profit factor: gross profit / gross loss
 */
export function calculateProfitFactor(trades: Trade[]): number {
  let grossProfit = 0;
  let grossLoss = 0;

  trades.forEach((t) => {
    if (t.result === 'open') return;
    const amt = t.amount || 0;
    if (amt > 0) grossProfit += amt;
    else if (amt < 0) grossLoss += Math.abs(amt);
  });

  if (grossLoss === 0) return grossProfit > 0 ? 99.99 : 0;
  return Math.round((grossProfit / grossLoss) * 100) / 100;
}

/**
 * Calculate trading balances and personal wallet
 */
export function calculateBalances(
  accounts: Account[],
  trades: Trade[],
  transactions: Transaction[],
  targetAccountId?: string | 'all'
) {
  const accountBalances: Record<string, number> = {};
  accounts.forEach((acc) => {
    accountBalances[acc.id] = acc.startBalance;
  });

  // Closed trades P/L
  trades.forEach((trade) => {
    if (trade.result === 'open') return;
    if (accountBalances[trade.accountId] !== undefined) {
      accountBalances[trade.accountId] += trade.amount || 0;
    }
  });

  // Personal transactions: deposits and withdrawals to/from accounts
  let walletBalance = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'withdraw') {
      // From trading account -> personal wallet
      if (tx.accountId && accountBalances[tx.accountId] !== undefined) {
        accountBalances[tx.accountId] -= tx.amount;
      }
      walletBalance += tx.amount;
    } else if (tx.type === 'deposit') {
      // From personal wallet -> trading account
      if (tx.accountId && accountBalances[tx.accountId] !== undefined) {
        accountBalances[tx.accountId] += tx.amount;
      }
      walletBalance -= tx.amount;
    } else if (tx.type === 'income') {
      walletBalance += tx.amount;
    } else if (tx.type === 'expense') {
      walletBalance -= tx.amount;
    }
  });

  let totalTradingBalance = 0;
  if (targetAccountId && targetAccountId !== 'all') {
    totalTradingBalance = accountBalances[targetAccountId] || 0;
  } else {
    totalTradingBalance = Object.values(accountBalances).reduce((sum, b) => sum + b, 0);
  }

  return {
    totalTradingBalance,
    walletBalance,
    accountBalances,
  };
}

/**
 * Generate PDF Monthly Report
 */
export function generateMonthlyPDFReport(
  monthStr: string, // YYYY-MM
  monthName: string, // e.g. "Oktoobar 2026"
  accounts: Account[],
  monthTrades: Trade[],
  monthTransactions: Transaction[],
  settings: UserSettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { winRate, wins, losses, breakevens, totalClosed } = calculateWinRate(monthTrades);
  const profitFactor = calculateProfitFactor(monthTrades);
  const monthPL = monthTrades.reduce((sum, t) => (t.result !== 'open' ? sum + (t.amount || 0) : sum), 0);

  // Styling palette
  doc.setFillColor(37, 99, 235); // Brand Blue
  doc.rect(0, 0, 210, 28, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('muraadn1 - Warbixinta Ganacsiga & Miisaaniyadda', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bisha: ${monthName} (${monthStr})  |  Taariikhda la soo saaray: ${new Date().toLocaleDateString('so-SO')}`, 14, 22);

  // Section 1: KPI Summary Card
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Guud-mar Ganacsi (Trading KPIs)', 14, 38);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, 182, 38, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Faa\'iido / Khasaare (P/L):', 20, 50);
  doc.setFont('helvetica', 'bold');
  if (monthPL >= 0) {
    doc.setTextColor(16, 185, 129); // green
  } else {
    doc.setTextColor(239, 68, 68); // red
  }
  doc.text(formatCurrency(monthPL, true), 80, 50);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.text('Heerka Guusha (Win Rate):', 20, 58);
  doc.setFont('helvetica', 'bold');
  doc.text(`${winRate}% (${wins} Guul, ${losses} Khasaare, ${breakevens} BE)`, 80, 58);

  doc.setFont('helvetica', 'normal');
  doc.text('Tirada Guud ee Trades:', 20, 66);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalClosed} xiran (${monthTrades.filter((t) => t.result === 'open').length} furan)`, 80, 66);

  doc.setFont('helvetica', 'normal');
  doc.text('Heerka Faa\'iidada (Profit Factor):', 20, 74);
  doc.setFont('helvetica', 'bold');
  doc.text(`${profitFactor}`, 80, 74);

  // Section 2: Akoonnada
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Akoonnada Ganacsiga (Accounts)', 14, 90);

  let y = 98;
  doc.setFontSize(9);
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Akoonka', 18, y + 5);
  doc.text('Bilaabasho', 80, y + 5);
  doc.text('P/L Bishan', 125, y + 5);
  doc.text('Trades', 170, y + 5);

  y += 9;
  doc.setFont('helvetica', 'normal');
  accounts.forEach((acc) => {
    const accTrades = monthTrades.filter((t) => t.accountId === acc.id);
    const accPL = accTrades.reduce((s, t) => (t.result !== 'open' ? s + (t.amount || 0) : s), 0);
    doc.text(acc.name, 18, y);
    doc.text(formatCurrency(acc.startBalance), 80, y);
    doc.text(formatCurrency(accPL, true), 125, y);
    doc.text(`${accTrades.length}`, 170, y);
    y += 7;
  });

  // Section 3: Shakhsi (Personal Wallet)
  y += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Miisaaniyadda Shakhsiga (Personal Budget)', 14, y);

  y += 8;
  const expenses = monthTransactions.filter((tx) => tx.type === 'expense');
  const incomes = monthTransactions.filter((tx) => tx.type === 'income');
  const withdrawals = monthTransactions.filter((tx) => tx.type === 'withdraw');
  const deposits = monthTransactions.filter((tx) => tx.type === 'deposit');

  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const totalWithdrawal = withdrawals.reduce((s, t) => s + t.amount, 0);
  const totalDeposit = deposits.reduce((s, t) => s + t.amount, 0);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Kharashka Guud ee Bishan: ${formatCurrency(totalExpense)}`, 18, y);
  y += 6;
  doc.text(`• Dakhliga Guud ee Kale: ${formatCurrency(totalIncome)}`, 18, y);
  y += 6;
  doc.text(`• Ka-bixid Akoonka Ganacsiga (Withdrawals): ${formatCurrency(totalWithdrawal)}`, 18, y);
  y += 6;
  doc.text(`• Dhigasho Akoonka Ganacsiga (Deposits): ${formatCurrency(totalDeposit)}`, 18, y);

  // Section 4: Trade List sample
  y += 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Diiwaanka Ganacsiyada Bishan (Trades)', 14, y);

  y += 7;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Taariikh', 18, y + 5);
  doc.text('Pair', 45, y + 5);
  doc.text('B/S', 70, y + 5);
  doc.text('Natiijo', 95, y + 5);
  doc.text('Qaddarka', 130, y + 5);
  doc.text('Nafsiga', 165, y + 5);

  y += 9;
  doc.setFont('helvetica', 'normal');
  const sortedTrades = [...monthTrades].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);
  sortedTrades.forEach((t) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(t.date, 18, y);
    doc.text(t.pair, 45, y);
    doc.text(t.direction.toUpperCase(), 70, y);
    doc.text(t.result === 'win' ? 'Guul' : t.result === 'loss' ? 'Khasaare' : t.result === 'breakeven' ? 'BE' : 'Furan', 95, y);
    doc.text(t.result === 'open' ? 'Furan' : formatCurrency(t.amount, true), 130, y);
    doc.text(t.emotion || '-', 165, y);
    y += 6.5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('muraadn1 - Diiwaanka Ganacsiga Forex & Miisaaniyadda Shakhsiga | Xogtaadu waa mid gaar ah', 14, 290);

  doc.save(`muraadn1_warbixin_${monthStr}.pdf`);
}

/**
 * CSV Import Parser
 */
export function parseTradesFromCSV(csvText: string, defaultAccountId: string, userId: string): Partial<Trade>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
  const results: Partial<Trade>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (row.length < 2) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = row[idx] || '';
    });

    const date = rowObj['date'] || rowObj['taariikh'] || rowObj['open time'] || new Date().toISOString().split('T')[0];
    const pair = (rowObj['pair'] || rowObj['symbol'] || rowObj['lamaane'] || 'EURUSD').toUpperCase();
    const direction = (rowObj['direction'] || rowObj['type'] || rowObj['dhinac'] || 'buy').toLowerCase().includes('sell') ? 'sell' : 'buy';
    
    let result: 'win' | 'loss' | 'breakeven' | 'open' = 'win';
    const rawResult = (rowObj['result'] || rowObj['natiijo'] || '').toLowerCase();
    const rawAmount = parseFloat(rowObj['amount'] || rowObj['profit'] || rowObj['pnl'] || rowObj['p/l'] || '0');

    if (rawResult.includes('break') || rawResult === 'be' || (rawResult === '' && rawAmount === 0)) {
      result = 'breakeven';
    } else if (rawResult.includes('loss') || rawResult.includes('khasaare') || rawAmount < 0) {
      result = 'loss';
    } else if (rawResult.includes('open') || rawResult.includes('furan')) {
      result = 'open';
    }

    results.push({
      userId,
      accountId: defaultAccountId,
      date: date.substring(0, 10),
      pair,
      direction,
      result,
      amount: result === 'open' ? null : rawAmount,
      entry: rowObj['entry'] ? parseFloat(rowObj['entry']) : null,
      stopLoss: rowObj['stoploss'] || rowObj['sl'] ? parseFloat(rowObj['stoploss'] || rowObj['sl']) : null,
      takeProfit: rowObj['takeprofit'] || rowObj['tp'] ? parseFloat(rowObj['takeprofit'] || rowObj['tp']) : null,
      emotion: 'Degan',
      followedPlan: 'yes',
      notes: rowObj['notes'] || rowObj['faallo'] || 'CSV Imported trade',
      chartImages: [],
      checkedRules: [],
      createdAt: new Date().toISOString(),
    });
  }

  return results;
}

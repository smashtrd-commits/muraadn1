// Audio Alarm synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;
let activeAlarmInterval: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSingleBeep(frequency = 880, duration = 0.25, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playTestChime() {
  playSingleBeep(587.33, 0.2, 'triangle'); // D5
  setTimeout(() => playSingleBeep(880, 0.35, 'sine'), 160); // A5
  setTimeout(() => playSingleBeep(1174.66, 0.5, 'sine'), 360); // D6
}

export function startContinuousAlarm() {
  stopContinuousAlarm();

  // Play immediately
  playTestChime();

  // Repeat every 2 seconds
  activeAlarmInterval = setInterval(() => {
    playTestChime();
  }, 2200);
}

export function stopContinuousAlarm() {
  if (activeAlarmInterval) {
    clearInterval(activeAlarmInterval);
    activeAlarmInterval = null;
  }
}

export function playTimerFinishedChime() {
  // Pleasant 4-note ascending fanfare chime
  playSingleBeep(523.25, 0.2, 'sine'); // C5
  setTimeout(() => playSingleBeep(659.25, 0.2, 'sine'), 150); // E5
  setTimeout(() => playSingleBeep(783.99, 0.25, 'sine'), 300); // G5
  setTimeout(() => playSingleBeep(1046.50, 0.6, 'triangle'), 480); // C6
}

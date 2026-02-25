const audioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = audioCtx();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch {}
}

export function playWireShow(wireIdx: number) {
  const freqs = [330, 440, 550, 660, 770];
  playTone(freqs[wireIdx] || 440, 0.3, "sine", 0.12);
}

export function playWireClick(wireIdx: number) {
  const freqs = [330, 440, 550, 660, 770];
  playTone(freqs[wireIdx] || 440, 0.15, "triangle", 0.15);
}

export function playCorrect() {
  playTone(523, 0.1, "sine", 0.12);
  setTimeout(() => playTone(659, 0.1, "sine", 0.12), 100);
  setTimeout(() => playTone(784, 0.15, "sine", 0.15), 200);
}

export function playBoom() {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, c.currentTime + 0.5);
    gain.gain.setValueAtTime(0.25, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.5);
  } catch {}
}

export function playTick() {
  playTone(800, 0.05, "square", 0.06);
}

export function playReactionGo() {
  playTone(880, 0.08, "sine", 0.12);
  setTimeout(() => playTone(1100, 0.12, "sine", 0.15), 80);
}

export function playReactionHit() {
  playTone(660, 0.08, "sine", 0.1);
  setTimeout(() => playTone(880, 0.08, "sine", 0.1), 70);
  setTimeout(() => playTone(1100, 0.12, "sine", 0.12), 140);
}

export function playMemoryFlip() {
  playTone(600, 0.08, "sine", 0.08);
}

export function playMemoryMatch() {
  playTone(523, 0.1, "sine", 0.1);
  setTimeout(() => playTone(784, 0.15, "sine", 0.12), 100);
}

export function playConfettiReveal() {
  const notes = [523, 587, 659, 784, 880, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, "sine", 0.08), i * 80);
  });
}

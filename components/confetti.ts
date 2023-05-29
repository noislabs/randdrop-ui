import { confetti, ConfettiFirstParam } from 'tsparticles-confetti';

const colors = ["#0ef025", "#ff00f7", "#ff0022", "#0015fc", "#eeff00"];

export const sprayConfetti = (end: number) => {
  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });

    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};
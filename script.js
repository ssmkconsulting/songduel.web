const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const choiceButtons = document.querySelectorAll('[data-choice]');
const result = document.querySelector('[data-demo-result] p');
const roundLabel = document.querySelector('[data-round]');
const skipButton = document.querySelector('[data-demo-skip]');
let round = 1;
let pendingChoice = null;
let actionTimer = null;
let countdownTimer = null;

const clearTimers = () => {
  window.clearTimeout(actionTimer);
  window.clearInterval(countdownTimer);
  actionTimer = null;
  countdownTimer = null;
};

const resetDemoActions = () => {
  clearTimers();
  pendingChoice = null;
  choiceButtons.forEach((item) => item.classList.remove('selected'));
  skipButton?.classList.remove('pending');
  if (skipButton) skipButton.textContent = 'Skip this matchup';
};

const advanceRound = () => {
  round += 1;
  if (roundLabel) roundLabel.textContent = String(round).padStart(2, '0');
};

const beginCountdown = (onTick) => {
  let seconds = 3;
  onTick(seconds);
  countdownTimer = window.setInterval(() => {
    seconds -= 1;
    if (seconds > 0) onTick(seconds);
  }, 1000);
};

choiceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (pendingChoice === button) {
      resetDemoActions();
      if (result) result.textContent = 'Pick canceled. The matchup is still yours to decide.';
      return;
    }

    resetDemoActions();
    pendingChoice = button;
    button.classList.add('selected');
    beginCountdown((seconds) => {
      if (result) result.textContent = `${button.dataset.choice} selected — ${seconds} second${seconds === 1 ? '' : 's'} to cancel or switch.`;
    });
    actionTimer = window.setTimeout(() => {
      const winner = button.dataset.choice;
      resetDemoActions();
      advanceRound();
      if (result) result.textContent = `${winner} wins. Your live ranking just got a little sharper.`;
    }, 3000);
  });
});

skipButton?.addEventListener('click', () => {
  if (skipButton.classList.contains('pending')) {
    resetDemoActions();
    if (result) result.textContent = 'Skip undone. Keep this matchup or pick either song.';
    return;
  }

  resetDemoActions();
  skipButton.classList.add('pending');
  beginCountdown((seconds) => {
    skipButton.textContent = `Undo skip · ${seconds}`;
    if (result) result.textContent = `Skip pending — ${seconds} second${seconds === 1 ? '' : 's'} to undo or choose a song.`;
  });
  actionTimer = window.setTimeout(() => {
    resetDemoActions();
    advanceRound();
    if (result) result.textContent = 'Matchup skipped. No winner was recorded.';
  }, 3000);
});

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

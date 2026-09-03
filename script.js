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

const beginCountdown = (duration, onTick) => {
  let seconds = duration;
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
    beginCountdown(3, (seconds) => {
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
  beginCountdown(2, (seconds) => {
    skipButton.textContent = `Undo skip · ${seconds}`;
    if (result) result.textContent = `Skip pending — ${seconds} second${seconds === 1 ? '' : 's'} to undo or choose a song.`;
  });
  actionTimer = window.setTimeout(() => {
    resetDemoActions();
    advanceRound();
    if (result) result.textContent = 'Matchup skipped. No winner was recorded.';
  }, 2000);
});

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const feedbackForm = document.querySelector('[data-feedback-form]');

if (feedbackForm) {
  const feedbackRecipient = 'ssmk.consulting@icloud.com';
  const categoryInput = feedbackForm.querySelector('[data-feedback-category]');
  const messageInput = feedbackForm.querySelector('[data-feedback-message]');
  const messageCount = feedbackForm.querySelector('[data-feedback-count]');
  const followUpInput = feedbackForm.querySelector('[data-feedback-follow-up]');
  const emailField = feedbackForm.querySelector('[data-feedback-email-field]');
  const emailInput = feedbackForm.querySelector('[data-feedback-email]');
  const copyButton = feedbackForm.querySelector('[data-copy-feedback]');
  const feedbackStatus = feedbackForm.querySelector('[data-feedback-status]');

  const updateStatus = (message) => {
    feedbackStatus.textContent = message;
  };

  const buildFeedbackDetails = () => {
    const sharesEmail = followUpInput.checked;
    return [
      'SongDuel website feedback',
      '',
      `Topic: ${categoryInput.value}`,
      `Reply email: ${sharesEmail ? emailInput.value.trim() : 'Not shared — follow-up is not possible'}`,
      '',
      'Feedback:',
      messageInput.value.trim(),
      '',
      'Sent from songduel.app'
    ].join('\n');
  };

  messageInput.addEventListener('input', () => {
    messageCount.textContent = String(messageInput.value.length);
  });

  followUpInput.addEventListener('change', () => {
    emailField.hidden = !followUpInput.checked;
    emailInput.required = followUpInput.checked;
    if (followUpInput.checked) emailInput.focus();
  });

  const validateFeedback = () => {
    if (!messageInput.value.trim()) {
      updateStatus('Please write a short message before continuing.');
      messageInput.focus();
      return false;
    }
    if (followUpInput.checked && !emailInput.checkValidity()) {
      updateStatus('Please enter a valid reply email, or turn off email sharing.');
      emailInput.focus();
      return false;
    }
    return true;
  };

  feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateFeedback()) return;

    const subject = `SongDuel feedback — ${categoryInput.value}`;
    const mailto = `mailto:${feedbackRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildFeedbackDetails())}`;
    updateStatus('Your email draft should open now. Review the message and press Send.');
    window.location.href = mailto;
  });

  copyButton.addEventListener('click', async () => {
    if (!validateFeedback()) return;
    const details = buildFeedbackDetails();

    try {
      await navigator.clipboard.writeText(details);
      updateStatus('Feedback details copied. Paste them into an email to ssmk.consulting@icloud.com.');
    } catch {
      const helper = document.createElement('textarea');
      helper.value = details;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.append(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
      updateStatus('Feedback details copied. Paste them into an email to ssmk.consulting@icloud.com.');
    }
  });
}

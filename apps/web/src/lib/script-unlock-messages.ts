export type ScriptUnlockAlert = { title: string; message: string };

export function notEnoughCreditsAlert(creditsPerPage: number, scriptCredits: number): ScriptUnlockAlert {
  const costLabel = `${creditsPerPage} credit${creditsPerPage === 1 ? '' : 's'}`;
  const haveLabel = `${scriptCredits} credit${scriptCredits === 1 ? '' : 's'}`;
  return {
    title: 'Not enough credits',
    message: `Unlocking this page costs ${costLabel}, but you only have ${haveLabel}. Use "Buy credits" below to add more, then try again.`,
  };
}

export function formatScriptUnlockAlert(
  rawMessage: string,
  ctx: { creditsPerPage: number; scriptCredits: number },
): ScriptUnlockAlert {
  const m = rawMessage.toLowerCase();

  if (
    m.includes('sign in') ||
    m.includes('unauthorized') ||
    m.includes('must be logged') ||
    m.includes('jwt')
  ) {
    return {
      title: 'Sign in required',
      message:
        'You need to sign in or create an account before you can unlock script pages.',
    };
  }

  if (m.includes('verification') || m.includes('identity')) {
    return {
      title: 'Verification required',
      message:
        'Complete identity verification in Profile → Security before unlocking script pages.',
    };
  }

  if (m.includes('not enough') && m.includes('credit')) {
    return notEnoughCreditsAlert(ctx.creditsPerPage, ctx.scriptCredits);
  }

  if (m.includes('already unlocked')) {
    return {
      title: 'Already unlocked',
      message: 'You have already unlocked this page. Refresh the page to read it.',
    };
  }

  if (m.includes('already free') || m.includes('no credits needed')) {
    return {
      title: 'Page is free',
      message: 'This page is already available to read — no credits needed.',
    };
  }

  if (m.includes('not configured')) {
    return {
      title: 'Sample not ready',
      message: 'This screenplay sample is not available yet. Check back later.',
    };
  }

  if (m.includes('not found') && m.includes('page')) {
    return {
      title: 'Page not found',
      message: 'This script page could not be found. Refresh the page and try again.',
    };
  }

  return {
    title: 'Could not unlock page',
    message:
      'Make sure you are signed in, verified, and have enough credits. If the problem continues, refresh the page.',
  };
}

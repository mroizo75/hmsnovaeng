export function calculateNextReviewDate(base: Date, months: number): Date {
  if (!(base instanceof Date) || Number.isNaN(base.getTime())) {
    return new Date();
  }

  const utcBase = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  const next = new Date(utcBase.getTime());
  next.setUTCMonth(next.getUTCMonth() + Math.max(months, 1));

  if (next.getUTCDate() !== utcBase.getUTCDate()) {
    next.setUTCDate(0);
  }

  return next;
}

export function parseDateInput(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}



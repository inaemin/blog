const yearsUnit = { label: "년", maxSeconds: Number.POSITIVE_INFINITY, seconds: 31104000 } as const;
const relativeTimeUnits = [
  { label: "초", maxSeconds: 60, seconds: 1 },
  { label: "분", maxSeconds: 3600, seconds: 60 },
  { label: "시", maxSeconds: 86400, seconds: 3600 },
  { label: "일", maxSeconds: 2592000, seconds: 86400 },
  { label: "달", maxSeconds: 31104000, seconds: 2592000 },
  yearsUnit,
] as const;

export function formatRelativeTime(createdAt: string) {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
  const unit = relativeTimeUnits.find((timeUnit) => elapsedSeconds < timeUnit.maxSeconds) ?? yearsUnit;

  return `${Math.floor(elapsedSeconds / unit.seconds)}${unit.label} 전`;
}

import { getLogger, ReadonlyBinding } from 'react-bindings';

export const doSpecialLoggingForLockedWaitable = ({
  id,
  lockedUntil,
  lockedWhile
}: {
  id: string;
  lockedUntil: readonly (ReadonlyBinding | undefined)[];
  lockedWhile: readonly (ReadonlyBinding | undefined)[];
}) => {
  const reasons: string[] = [];

  for (const condition of lockedUntil) {
    if (condition !== undefined && !Boolean(condition.get())) {
      reasons.push(`${condition.id} is falsey`);
    }
  }

  for (const condition of lockedWhile) {
    if (condition !== undefined && Boolean(condition.get())) {
      reasons.push(`${condition.id} is truthy`);
    }
  }

  getLogger().debug?.(`Tried to execute waitable ${id}, but it's locked because: ${reasons.join(' and ')}`);
};

export const doSpecialLoggingForUnlockedWaitable = ({
  id,
  lockedUntil,
  lockedWhile
}: {
  id: string;
  lockedUntil: readonly (ReadonlyBinding | undefined)[];
  lockedWhile: readonly (ReadonlyBinding | undefined)[];
}) => {
  const reasons: string[] = [];

  for (const condition of lockedUntil) {
    if (condition !== undefined && Boolean(condition.get())) {
      reasons.push(`${condition.id} is truthy`);
    }
  }

  for (const condition of lockedWhile) {
    if (condition !== undefined && !Boolean(condition.get())) {
      reasons.push(`${condition.id} is falsey`);
    }
  }

  getLogger().debug?.(`${id} is no longer locked because: ${reasons.join(' and ')}`);
};

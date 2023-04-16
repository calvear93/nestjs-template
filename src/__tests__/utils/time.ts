import { vi } from 'vitest';

export const useFakeTimers = () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date());
};

export const restoreTimers = () => {
	vi.useRealTimers();
};

export const advanceTime = (time: seconds) => {
	vi.setSystemTime(new Date(Date.now() + time * 1000));
};

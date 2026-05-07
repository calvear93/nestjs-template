import { vi } from 'vitest';

export type FakeTimerInstallOpts = typeof vi.useFakeTimers extends (
	opts: infer T,
) => any
	? T
	: never;

export const useFakeTimers = (config: FakeTimerInstallOpts) => {
	vi.useFakeTimers(config);
	vi.setSystemTime(new Date());
};

export const restoreTimers = () => {
	vi.useRealTimers();
};

export const advanceTime = (time: number) => {
	vi.setSystemTime(new Date(Date.now() + time * 1000));
};

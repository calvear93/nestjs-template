const realEnv: Record<string, string | undefined> = {};

export const mockEnv = (key: string, value: boolean | number | string) => {
	realEnv[key] ??= process.env[key];
	process.env[key] = value.toString();
};

export const restoreEnv = (key: string) => {
	process.env[key] = realEnv[key];
	realEnv[key] = undefined;
};

export const restoreAllEnv = () => {
	for (const key in realEnv) {
		restoreEnv(key);
	}
};

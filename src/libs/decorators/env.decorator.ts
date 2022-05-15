const ADAPTER = {
    string: (value?: string) => value,
    boolean: (value?: string) => value === 'true',
    number: (value?: string) => value && +value,
    object: (value?: string) => value && JSON.parse(value)
};

/**
 * Transforms env value with adapters
 * depending of specified type.
 *
 * @param {string} name
 * @param {IEnvVarArgs['type']} type
 * @returns {*}
 */
function getEnv(name: string, type: IEnvVarArgs['type']) {
    if (!type) return process.env[name];

    return ADAPTER[type](process.env[name]);
}

export interface IEnvGroupArgs {
    prefix?: string;
    cache?: boolean;
    inherit?: new () => any;
}

export interface IEnvVarArgs {
    name?: string;
    type?: keyof typeof ADAPTER;
    cache?: boolean;
}

/**
 * Retrieves metadata from class.
 *
 * @param {*} prototype
 * @returns {*}
 */
function getMetadata(prototype: any) {
    return (
        Object.getOwnPropertyDescriptors(prototype).___metadata___ ?? {
            value: { properties: {} },
            configurable: true
        }
    );
}

/**
 * Injects environment variables to a class members.
 *
 * @export
 * @template T
 * @param {IEnvGroupArgs} [config]
 *
 * @returns {*}  {(target: T) => void}
 */
export function EnvGroup<T extends new (...params: any[]) => T>(
    config?: IEnvGroupArgs
): (target: T) => void {
    const { prefix = '', cache: useCache, inherit } = config ?? {};

    const values: Record<string, any> = {};

    return (target: T) => {
        const metadata = getMetadata(target.prototype);

        if (inherit) {
            const {
                value: { config: inherited }
            } = getMetadata(inherit.prototype);

            config = {
                ...inherited.config,
                ...config,
                prefix: `${inherited.prefix ?? ''}${prefix}`
            };
        }

        metadata.value.config = config;
        Object.defineProperty(target.prototype, '___metadata___', metadata);

        const {
            value: { properties }
        } = metadata;

        for (const key in properties) {
            const {
                type,
                name = key,
                cache = useCache
            }: IEnvVarArgs = properties[key];

            const envKey = `${config?.prefix}${name}`;

            Object.defineProperty(target.prototype, key, {
                get: () => {
                    if (cache) {
                        values[key] ??= getEnv(envKey, type);

                        return values[key];
                    }

                    return values[key] ?? getEnv(envKey, type);
                },
                set: (value: any) => {
                    values[key] = value;
                    process.env[envKey] = value;
                }
            });
        }
    };
}

/**
 * Defines environment variables for injecting.
 *
 * @export
 * @param {IEnvVarArgs} [config]
 *
 * @returns {*}
 */
export function EnvVar(config?: IEnvVarArgs) {
    return <T extends object>(target: T, key: string) => {
        const proto = target.constructor.prototype;
        const metadata = getMetadata(proto);
        metadata.value.properties[key] = config ?? {};

        Object.defineProperty(proto, '___metadata___', metadata);
    };
}

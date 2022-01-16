export type DecoratorsLookUp<T> = {
    [K in keyof T]?: MethodDecorator[];
};

/**
 * Decorator factory for apply many decorators
 * to class members in a clean way.
 *
 * @example
 *  // any.component.docs.ts
 *  import { DecoratorsLookUp } from '...';
 *
 *  export const AnyComponentDocs: DecoratorsLookUp<any> = {
 *      anyMethod: [AnyDecorator()]
 *  };
 *
 *  // any.component.ts
 *  import { AttachDecorators } from '...';
 *  import { AnyComponentDocs } from '...';
 *
 *  @AttachDecorators(AnyComponentDocs)
 *  export class AnyComponent { ... }
 *
 * @template T
 * @param {DecoratorsLookUp<T>} lookup each mirror member
 *  contains an array of decorator for apply
 *
 * @returns {(target: T) => void} class decorator
 */
export function Attach<T extends new (...params: any[]) => T>(
    lookup: DecoratorsLookUp<T>
): (target: T) => void {
    return (target: T) => {
        // gets properties for decorate
        const keys = Object.keys(lookup) as Array<keyof typeof lookup>;

        for (const key of keys) {
            // array with method decorators
            const decorators = lookup[key];

            const property = Object.getOwnPropertyDescriptor(
                target.prototype,
                key
            );

            if (property && decorators) {
                // applies every decorator
                const decoratedProperty = decorators.reduce(
                    (prop, decorator) => {
                        return (
                            decorator(prop.value, prop.value.name, prop) ?? prop
                        );
                    },
                    property
                );

                Object.defineProperty(target.prototype, key, decoratedProperty);
            }
        }
    };
}

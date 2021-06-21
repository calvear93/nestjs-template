/**
 * Decorator for creates a normalized
 * property from other one.
 *
 * @param {PropKeyFromType} propertyFromName property name from take the value
 *
 * @returns {Function} decorator function.
 */
export function NormalizedFrom<
    ClassType extends Record<PropertyKey, any> & Record<PropKeyFromType, string>,
    PropKeyFromType extends PropertyKey
>(propertyFromName: PropKeyFromType)
{
    return <
        ClassTypeExtended extends ClassType & Record<PropKeyType, string>,
        PropKeyType extends PropertyKey
    >(target: ClassTypeExtended, propertyKey: PropKeyType) =>
    {
        Object.defineProperty(target, propertyKey, {
            configurable: false,
            get(this: ClassTypeExtended)
            {
                // normalizes the from property value
                return this[propertyFromName].toLowerCase().normalize('NFD').replace(/[\p{Diacritic}|\u0027]/gu, '');
            },
            set(this: ClassTypeExtended)
            {
                // setter is disabled
                return;
            }
        });
    };
}

type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};

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
    >(target: ClassTypeExtended, propertyKey: PropKeyType): void =>
    {
        applyNormalize<ClassTypeExtended>(target, propertyKey, propertyFromName);
    };
}

/**
 * Decorator for creates a normalized
 * optional property from other one.
 *
 * @param {PropKeyFromType} propertyFromName property name from take the value
 *
 * @returns {Function} decorator function.
 */
export function NormalizedFromOptional<
    ClassType extends Record<PropertyKey, any> & PartialRecord<PropKeyFromType, string>,
    PropKeyFromType extends PropertyKey
>(propertyFromName: PropKeyFromType)
{
    return <
        ClassTypeExtended extends ClassType & PartialRecord<PropKeyType, string>,
        PropKeyType extends PropertyKey
    >(target: ClassTypeExtended, propertyKey: PropKeyType): void =>
    {
        applyNormalize<ClassTypeExtended>(target, propertyKey, propertyFromName);
    };
}

/**
 * Applies decorator normalizer for string member.
 *
 * @template ClassTypeExtended
 *
 * @param {ClassTypeExtended} target object
 * @param {PropertyKey} propertyKey target property name
 * @param {PropertyKey} propertyFromName source property name
 */
function applyNormalize<ClassTypeExtended>(target: ClassTypeExtended, propertyKey: PropertyKey, propertyFromName: PropertyKey): void
{
    Object.defineProperty(target, propertyKey, {
        configurable: false,
        get(this: ClassTypeExtended)
        {
            // normalizes the from property value
            return this[propertyFromName]?.toLowerCase().normalize('NFD').replace(/[\p{Diacritic}|\u0027]/gu, '');
        },
        set(this: ClassTypeExtended)
        {
            // setter is disabled
            return;
        }
    });
}

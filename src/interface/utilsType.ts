export type objType = { [k in PropertyKey]: unknown }

export type ExtendedObjectType<obj1 extends objType, obj2 extends objType> = {
  [k in never as keyof obj1 | keyof obj2]: k extends keyof obj1 & keyof obj2
    ? obj1[k] | obj2[k]
    : k extends keyof obj1
    ? obj1[k]
    : obj2[k]
}

export const getKeys = <T extends Object>(o: T) => Object.keys(o) as Array<keyof T>
export const getValues = <T extends Object>(o: T) => Object.values(o) as Array<T[keyof T]>
export const getEntries = <T extends Object>(o: T) => Object.entries(o) as Array<[keyof T, T[keyof T]]>

export const getEnumKeys = <T>(en: T): Array<keyof T> => {
  const arr = getValues(en)
  return arr.slice(0, arr.length / 2) as any as Array<keyof T>
}
export const getEnumValues = <T>(en: T): Array<T[keyof T]> => {
  const arr = getValues(en)
  return arr.slice(arr.length / 2)
}

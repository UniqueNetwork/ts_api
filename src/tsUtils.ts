export const getKeys = <T extends Object>(o: T) => Object.keys(o) as Array<keyof T>
export const getValues = <T extends Object>(o: T) => Object.values(o) as Array<T[keyof T]>
export const getEntries = <T extends Object>(o: T) => Object.entries(o) as Array<[keyof T, T[keyof T]]>

export const getEnumKeys = <T extends Object>(en: T) => {
  const arr = getValues(en)
  const keys = arr.slice(arr.length / 2)
  return keys
}

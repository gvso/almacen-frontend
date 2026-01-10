type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${SnakeCase<U>}`
  : S;

type SnakeCaseKeys<T> = T extends Array<infer U>
  ? Array<SnakeCaseKeys<U>>
  : T extends object
  ? {
      [K in keyof T as SnakeCase<string & K>]: SnakeCaseKeys<T[K]>;
    }
  : T;

type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

type CamelizeKeys<T> = T extends Array<infer U>
  ? Array<CamelizeKeys<U>>
  : T extends object
  ? {
      [K in keyof T as CamelCase<string & K>]: CamelizeKeys<T[K]>;
    }
  : T;

function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toCamelCase<T>(obj: T): CamelizeKeys<T> {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase) as CamelizeKeys<T>;
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = snakeToCamel(key);
      acc[camelKey as keyof CamelizeKeys<T>] = toCamelCase(
        value
      ) as CamelizeKeys<T>[keyof CamelizeKeys<T>];
      return acc;
    }, {} as CamelizeKeys<T>);
  }
  return obj as CamelizeKeys<T>;
}

export function toSnakeCase<T>(obj: T): SnakeCaseKeys<T> {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as SnakeCaseKeys<T>;
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const snakeKey = camelToSnake(key);
      acc[snakeKey as keyof SnakeCaseKeys<T>] = toSnakeCase(
        value
      ) as SnakeCaseKeys<T>[keyof SnakeCaseKeys<T>];
      return acc;
    }, {} as SnakeCaseKeys<T>);
  }
  return obj as SnakeCaseKeys<T>;
}

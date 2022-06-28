/** A plain or promised type */
export type TypeOrPromisedType<T> = T | Promise<T>;

/** Infers the result of a promise */
export type InferResolvedPromisedType<PromiseT> = PromiseT extends Promise<infer T> ? T : never;

/** Infers a type or the result of a promise */
export type InferResolvedTypeOrPromisedType<TypeOrPromiseT> = TypeOrPromiseT extends Promise<infer T> ? T : TypeOrPromiseT;

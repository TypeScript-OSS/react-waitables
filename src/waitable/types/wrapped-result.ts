/** If ok, the value represents a success value.  If not ok, it represents a failure value */
export type WrappedResult<SuccessT, FailureT = any> = { ok: true; value: SuccessT } | { ok: false; value: FailureT };

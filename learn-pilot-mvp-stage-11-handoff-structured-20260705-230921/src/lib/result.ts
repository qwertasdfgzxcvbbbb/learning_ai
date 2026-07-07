export type AppError = {
  code: string;
  message: string;
};

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: AppError };

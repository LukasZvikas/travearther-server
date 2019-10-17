export class ErrorREST extends Error {
  public response: { status: number; message: string; detail: string };

  constructor(
    error: { status: number; message: string },
    detail: string = undefined,
    ...args
  ) {
    super(...args);
    this.response = {
      status: error.status,
      message: error.message,
      detail: detail
    };
  }
}

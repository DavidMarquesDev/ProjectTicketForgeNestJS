export type ApiSuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
    meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
    success: false;
    message: string;
    code: string;
    errors?: Record<string, unknown>;
    trace_id?: string;
};

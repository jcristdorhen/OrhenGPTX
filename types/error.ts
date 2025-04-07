export interface ApiError {
  error: string;
  code: string;
  timestamp: number;
  status: "error";
}

export interface ApiSuccess<T> {
  data: T;
  timestamp: number;
  status: "success";
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const catchError = async (error: unknown) => {
  if (isAxiosError(error)) {
    console.error({
      req: error.request,
      message: error.message,
      name: error.name,
      code: error.code,
      data: error.response?.data,
      status: error.response?.status,
    });
  } else if (error instanceof Error) {
    console.error({
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  }
};

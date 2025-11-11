import { CheckCircleFilled, ClockCircleFilled, StopFilled } from "@ant-design/icons";
import { createElement } from "react";
import type { ReactNode } from "react";
import type { UserStatus } from "../../../data";

export function getStatusBadge(status: UserStatus): { color: string; icon: ReactNode } {
  switch (status) {
    case "active":
      return { color: "success", icon: createElement(CheckCircleFilled) };
    case "pending":
      return { color: "processing", icon: createElement(ClockCircleFilled) };
    case "inactive":
      return { color: "default", icon: createElement(ClockCircleFilled) };
    case "banned":
      return { color: "error", icon: createElement(StopFilled) };
    default:
      return { color: "default", icon: null };
  }
}

export function formatDate(value: string | Date | { $date?: string } | undefined | null): string {
  if (!value) {
    return "—";
  }

  // Handle MongoDB date format {$date: "..."}
  if (typeof value === 'object' && '$date' in value && value.$date) {
    value = value.$date;
  }

  // If it's already a Date object, convert to string
  if (value instanceof Date) {
    value = value.toISOString();
  }

  // If it's not a string, try to convert
  if (typeof value !== 'string') {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDelta(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }
  if (value < 0) {
    return `${value}`;
  }
  return "0";
}

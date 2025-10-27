import { ClockCircleFilled, PauseCircleFilled, ReadOutlined, CheckCircleFilled } from "@ant-design/icons";
import { createElement } from "react";
import type { ReactNode } from "react";
import type { BookStatus } from "../../../data";


export function getStatusMeta(status: BookStatus): { color: string; icon: ReactNode } {
  switch (status) {
    case "available":
      return { color: "success", icon: createElement(CheckCircleFilled) };
    case "loaned":
      return { color: "processing", icon: createElement(ReadOutlined) };
    case "reserved":
      return { color: "warning", icon: createElement(ClockCircleFilled) };
    case "archived":
      return { color: "default", icon: createElement(PauseCircleFilled) };
    default:
      return { color: "default", icon: null };
  }
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function timeAgo(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) {
    return `${minutes} phút trước`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} giờ trước`;
  }

  const days = Math.round(hours / 24);
  return `${days} ngày trước`;
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

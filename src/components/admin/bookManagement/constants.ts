import type { BookFormat, BookStatus } from "../../../data/mockBooks";

export const statusLabels: Record<BookStatus, string> = {
  available: "Có sẵn",
  loaned: "Đang mượn",
  reserved: "Đã đặt chỗ",
  archived: "Lưu trữ",
};

export const formatLabels: Record<BookFormat, string> = {
  hardcover: "Bìa cứng",
  paperback: "Bìa mềm",
  ebook: "Ebook",
  audiobook: "Audiobook",
};

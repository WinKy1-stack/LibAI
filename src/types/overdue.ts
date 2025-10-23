export type OverdueStatus = "returned" | "returned-late" | "delay";

export interface OverdueBook {
  key: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  bookId: string;
  title: string;
  author: string;
  overdueDays: number;
  status: OverdueStatus;
  fine: number;
}

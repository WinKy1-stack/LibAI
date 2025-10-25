import { Tag } from "antd";
import type { OverdueStatus } from "../../../types";

interface StatusTagProps {
  status: OverdueStatus;
}

export default function StatusTag({ status }: StatusTagProps) {
  const getStatusConfig = (status: OverdueStatus) => {
    switch (status) {
      case "returned":
        return { color: "success", text: "Đã trả" };
      case "returned-late":
        return { color: "success", text: "Đã trả (trễ)" };
      case "delaying":
        return { color: "error", text: "Đang trễ hạn" };
      default:
        return { color: "default", text: "Unknown" };
    }
  };

  const config = getStatusConfig(status);

  return <Tag color={config.color}>{config.text}</Tag>;
}


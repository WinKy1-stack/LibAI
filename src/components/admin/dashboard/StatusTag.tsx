import { Tag, theme} from "antd";
import type { OverdueStatus } from "../../../types";

interface StatusTagProps {
  status: OverdueStatus;
}

export default function StatusTag({ status }: StatusTagProps) {
  const { token } = theme.useToken();
  const getStatusConfig = (status: OverdueStatus) => {
    switch (status) {
      case "returned":
        return { color: token.colorSuccess, text: "Đã trả" };
      case "returned-late":
        return { color: token.colorSuccess, text: "Đã trả (trễ)" };
      case "delaying":
        return { color: token.colorError, text: "Đang trễ hạn" };
      default:
        return { color: token.colorInfo, text: "Unknown" };
    }
  };

  const config = getStatusConfig(status);

  return <Tag color={config.color}>{config.text}</Tag>;
}


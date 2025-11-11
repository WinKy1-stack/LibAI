import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface AlertMessageProps {
  type: "success" | "error";
  message: string;
}

export default function AlertMessage({ type, message }: AlertMessageProps) {
  return (
    <div
      className={`px-4 py-3 rounded-xl flex items-center gap-3 ${
        type === "success"
          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
      }`}
    >
      {type === "success" ? (
        <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
      ) : (
        <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
}


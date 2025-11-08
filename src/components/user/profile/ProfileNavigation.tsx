import { UserCircleIcon, KeyIcon } from "@heroicons/react/24/outline";

interface ProfileNavigationProps {
  activeSection: "info" | "password";
  onSectionChange: (section: "info" | "password") => void;
}

export default function ProfileNavigation({
  activeSection,
  onSectionChange,
}: ProfileNavigationProps) {
  return (
    <div className="mt-6 pt-6 border-t border-border-primary/30 space-y-2">
      <button
        onClick={() => onSectionChange("info")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          activeSection === "info"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg dark:from-purple-500 dark:to-blue-500"
            : "text-text-secondary hover:bg-background-primary hover:text-text-primary"
        }`}
      >
        <UserCircleIcon className="w-5 h-5" />
        <span className="font-medium">Thông tin cá nhân</span>
      </button>
      <button
        onClick={() => onSectionChange("password")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          activeSection === "password"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg dark:from-purple-500 dark:to-blue-500"
            : "text-text-secondary hover:bg-background-primary hover:text-text-primary"
        }`}
      >
        <KeyIcon className="w-5 h-5" />
        <span className="font-medium">Bảo mật</span>
      </button>
    </div>
  );
}


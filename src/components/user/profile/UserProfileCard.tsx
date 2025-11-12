import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { User } from "../../../types/auth";
import ProfileNavigation from "./ProfileNavigation";
import { 
  ROLE_LABELS, 
  ROLE_BADGE_STYLES, 
  STATUS_LABELS, 
  STATUS_COLORS, 
  AVATAR_SERVICE_URL 
} from "./constants";

type UserRole = keyof typeof ROLE_LABELS;
type UserStatus = keyof typeof STATUS_LABELS;

interface UserProfileCardProps {
  user: User;
  activeSection: "info" | "password";
  onSectionChange: (section: "info" | "password") => void;
}

export default function UserProfileCard({
  user,
  activeSection,
  onSectionChange,
}: UserProfileCardProps) {
  const getUserRole = (): UserRole => {
    return (user.role in ROLE_LABELS) ? user.role as UserRole : 'reader';
  };

  const getUserStatus = (): UserStatus => {
    return (user.status && user.status in STATUS_LABELS) ? user.status as UserStatus : 'active';
  };

  const role = getUserRole();
  const status = getUserStatus();

  return (
    <div className="bg-background-secondary rounded-2xl p-4 sm:p-6 shadow-lg border border-border-primary/30">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-primary/20 mb-4">
          <img
            src={`${AVATAR_SERVICE_URL}${encodeURIComponent(
              user.name || user.email || "user"
            )}`}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-text-primary text-center">
          {user.name}
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 text-center truncate max-w-full px-2">
          {user.email}
        </p>
        <span className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE_STYLES[role]}`}>
          {ROLE_LABELS[role]}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="space-y-3 pt-6 border-t border-border-primary/30">
        <div className="flex items-center gap-3 text-text-secondary">
          <div className="p-2 bg-background-primary rounded-lg">
            <BookOpenIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs">Sách đã mượn</p>
            <p className="text-base sm:text-lg font-bold text-text-primary">0</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-text-secondary">
          <div className="p-2 bg-background-primary rounded-lg">
            <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs">Cuộc trò chuyện</p>
            <p className="text-base sm:text-lg font-bold text-text-primary">0</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-text-secondary">
          <div className="p-2 bg-background-primary rounded-lg">
            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs">Trạng thái</p>
            <p className="text-xs sm:text-sm font-semibold text-text-primary">
              <span className={STATUS_COLORS[status]}>
                {STATUS_LABELS[status]}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ProfileNavigation
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
    </div>
  );
}


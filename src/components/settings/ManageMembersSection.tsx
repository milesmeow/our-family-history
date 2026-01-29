"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Trash2, Shield, Eye, User as UserIcon, Loader2 } from "lucide-react";
import { deleteUser } from "@/actions/users";

// User type for display purposes
export interface UserForManagement {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

interface ManageMembersSectionProps {
  users: UserForManagement[];
  currentUserId: string;
}

/**
 * Admin-only component for managing family members.
 * Uses hardcoded English strings since this is admin-only functionality.
 */
export function ManageMembersSection({ users, currentUserId }: ManageMembersSectionProps) {
  const router = useRouter();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Count admins to determine if delete should be disabled
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  const handleDelete = async (user: UserForManagement) => {
    const isLastAdmin = user.role === "ADMIN" && adminCount <= 1;

    if (isLastAdmin) {
      setError("Cannot delete the last administrator. Promote another user first.");
      return;
    }

    const isSelf = user.id === currentUserId;
    const confirmMessage = isSelf
      ? "Are you sure you want to delete your own account? You will be signed out and lose access to this family history."
      : `Are you sure you want to remove ${user.name || user.email} from the family? Their entries will remain but show "Unknown Author".`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingUserId(user.id);
    setError(null);

    const result = await deleteUser(user.id);

    if (result.success) {
      if (isSelf) {
        // If deleting self, redirect to home (will be signed out)
        window.location.href = "/";
      } else {
        router.refresh();
      }
    } else {
      setError(result.error);
    }

    setDeletingUserId(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-3.5 h-3.5" />;
      case "VIEWER":
        return <Eye className="w-3.5 h-3.5" />;
      default:
        return <UserIcon className="w-3.5 h-3.5" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";
      case "VIEWER":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "VIEWER":
        return "Viewer";
      default:
        return "Member";
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Manage Members
      </h2>
      <p className="text-gray-600 text-sm mb-4">
        View and manage family members. Deleting a user preserves their contributions but removes their access.
      </p>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const isLastAdmin = user.role === "ADMIN" && adminCount <= 1;
          const isDeleting = deletingUserId === user.id;

          return (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              {/* Avatar placeholder */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-700 font-medium text-sm">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">
                    {user.name || user.email}
                  </p>
                  {isCurrentUser && (
                    <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                      you
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>

              {/* Role badge */}
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
              >
                {getRoleIcon(user.role)}
                {getRoleLabel(user.role)}
              </span>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(user)}
                disabled={isDeleting || isLastAdmin}
                className={`p-2 rounded-lg transition-colors ${
                  isLastAdmin
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                } disabled:opacity-50`}
                title={
                  isLastAdmin
                    ? "Cannot delete the last admin"
                    : isCurrentUser
                      ? "Delete your account"
                      : "Remove member"
                }
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <p className="text-gray-500 text-center py-4">No members found.</p>
      )}

      {/* Help text */}
      <p className="mt-4 text-xs text-gray-500">
        Note: When a member is removed, their stories and comments remain in the family history but will show &quot;Unknown Author&quot;.
      </p>
    </div>
  );
}

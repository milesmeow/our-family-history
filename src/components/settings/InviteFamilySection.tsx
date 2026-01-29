"use client";

import { useState, useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { UserPlus, Mail, Clock, CheckCircle, X, RefreshCw, Trash2 } from "lucide-react";
import {
  createInvitation,
  resendInvitation,
  revokeInvitation,
} from "@/actions/invitations";

// Type for invitation with computed status
export interface InvitationWithStatus {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
  invitedBy: { name: string | null; email: string } | null;
  status: "pending" | "accepted" | "expired";
}

interface InviteFamilySectionProps {
  initialInvitations: InvitationWithStatus[];
}

export function InviteFamilySection({ initialInvitations }: InviteFamilySectionProps) {
  const router = useRouter();
  const t = useTranslations("settings.invitations");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Wrap createInvitation to handle success
  const handleCreateInvitation = async (
    prevState: Awaited<ReturnType<typeof createInvitation>> | null,
    formData: FormData
  ) => {
    setActionSuccess(null);
    setError(null);
    const result = await createInvitation(prevState, formData);
    if (result.success) {
      setActionSuccess(t("sent"));
      formRef.current?.reset();
      router.refresh();
    }
    return result;
  };

  const [createState, createAction, isCreating] = useActionState(handleCreateInvitation, null);

  const handleResend = async (id: string) => {
    setActionInProgress(id);
    setError(null);
    setActionSuccess(null);
    const result = await resendInvitation(id);
    setActionInProgress(null);
    if (result.success) {
      setActionSuccess(t("resent"));
      router.refresh();
    } else {
      setError(result.error);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm(t("revokeConfirm"))) {
      return;
    }
    setActionInProgress(id);
    setError(null);
    setActionSuccess(null);
    const result = await revokeInvitation(id);
    setActionInProgress(null);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }
  };

  const pendingInvitations = initialInvitations.filter((i) => i.status === "pending");
  const acceptedInvitations = initialInvitations.filter((i) => i.status === "accepted");
  const expiredInvitations = initialInvitations.filter((i) => i.status === "expired");

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("title")}</h2>
      <p className="text-gray-600 text-sm mb-4">{t("description")}</p>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {createState && !createState.success && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {createState.error}
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {actionSuccess}
        </div>
      )}

      {/* Invite form */}
      <form ref={formRef} action={createAction} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="email" className="sr-only">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder={t("emailPlaceholder")}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>
          <div className="sm:w-32">
            <label htmlFor="role" className="sr-only">
              {t("roleLabel")}
            </label>
            <select
              id="role"
              name="role"
              defaultValue="MEMBER"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
            >
              <option value="MEMBER">{t("roles.MEMBER")}</option>
              <option value="VIEWER">{t("roles.VIEWER")}</option>
              <option value="ADMIN">{t("roles.ADMIN")}</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {isCreating ? t("sending") : t("sendButton")}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">{t("rolesHelp")}</p>
      </form>

      {/* Invitations list */}
      <div className="space-y-4">
        {/* Pending invitations */}
        {pendingInvitations.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("pending")} ({pendingInvitations.length})
            </h3>
            <div className="space-y-2">
              {pendingInvitations.map((invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  onResend={handleResend}
                  onRevoke={handleRevoke}
                  isActionInProgress={actionInProgress === invitation.id}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        )}

        {/* Accepted invitations */}
        {acceptedInvitations.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              {t("accepted")} ({acceptedInvitations.length})
            </h3>
            <div className="space-y-2">
              {acceptedInvitations.map((invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  onResend={handleResend}
                  onRevoke={handleRevoke}
                  isActionInProgress={actionInProgress === invitation.id}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        )}

        {/* Expired invitations */}
        {expiredInvitations.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
              <X className="w-4 h-4" />
              {t("expired")} ({expiredInvitations.length})
            </h3>
            <div className="space-y-2">
              {expiredInvitations.map((invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  onResend={handleResend}
                  onRevoke={handleRevoke}
                  isActionInProgress={actionInProgress === invitation.id}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        )}

        {initialInvitations.length === 0 && (
          <p className="text-gray-500 text-center py-4">{t("noInvitations")}</p>
        )}
      </div>
    </div>
  );
}

interface InvitationRowProps {
  invitation: InvitationWithStatus;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
  isActionInProgress: boolean;
  locale: string;
}

function InvitationRow({ invitation, onResend, onRevoke, isActionInProgress, locale }: InvitationRowProps) {
  const t = useTranslations("settings.invitations");

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    accepted: "bg-green-100 text-green-700",
    expired: "bg-gray-100 text-gray-500",
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === "zh-TW" ? "zh-TW" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDateText = () => {
    if (invitation.status === "accepted") {
      return t("joined", { date: formatDate(invitation.usedAt!) });
    } else if (invitation.status === "expired") {
      return t("expiredOn", { date: formatDate(invitation.expiresAt) });
    } else {
      return t("expires", { date: formatDate(invitation.expiresAt) });
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Mail className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{invitation.email}</p>
        <p className="text-xs text-gray-500">
          {t(`roles.${invitation.role}`)} &middot; {getDateText()}
        </p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invitation.status]}`}>
        {t(`status.${invitation.status}`)}
      </span>
      {invitation.status === "pending" && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onResend(invitation.id)}
            disabled={isActionInProgress}
            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-50"
            title={t("resendTooltip")}
          >
            <RefreshCw className={`w-4 h-4 ${isActionInProgress ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => onRevoke(invitation.id)}
            disabled={isActionInProgress}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title={t("revokeTooltip")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      {invitation.status === "expired" && (
        <button
          onClick={() => onResend(invitation.id)}
          disabled={isActionInProgress}
          className="px-3 py-1 text-xs text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-50"
        >
          {isActionInProgress ? t("sending") : t("resend")}
        </button>
      )}
    </div>
  );
}

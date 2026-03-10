"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { requestChangeEmail } from "@/lib/profile-api";
import type { ProfileData } from "@/markup/profile";

const CLASS_BUTTON_SECONDARY =
  "rounded bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue";
const CLASS_LIST_ROW =
  "flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/5 bg-screenriot-bg-card px-4 py-3";

type Props = {
  profile: ProfileData;
  onEmailChangeRequested?: () => void;
};

export function AccountSecuritySection({
  profile,
  onEmailChangeRequested,
}: Props) {
  const { data: session } = useSession();
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSubmitLoading, setEmailSubmitLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleRequestChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || !session?.accessToken) return;
    setEmailMessage(null);
    setEmailSubmitLoading(true);
    try {
      await requestChangeEmail(session.accessToken, newEmail.trim());
      setEmailMessage({
        type: "success",
        text: "A confirmation link has been sent to the new email address.",
      });
      setNewEmail("");
      setEmailFormOpen(false);
      onEmailChangeRequested?.();
    } catch {
      setEmailMessage({
        type: "error",
        text: "Failed to send. This email may already be in use.",
      });
    } finally {
      setEmailSubmitLoading(false);
    }
  }

  return (
    <ul className="mt-4 space-y-3" role="list">
      <li className={CLASS_LIST_ROW}>
        <div>
          <p className="font-medium text-white">Password</p>
          <p className="mt-0.5 text-sm text-screenriot-muted">
            Reset your password via email link.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className={CLASS_BUTTON_SECONDARY}
          aria-label="Reset password via email"
        >
          Reset password
        </Link>
      </li>
      <li className={CLASS_LIST_ROW}>
        <div>
          <p className="font-medium text-white">Two-Factor Authentication</p>
          <p className="mt-0.5 text-sm text-screenriot-muted">
            Add an extra layer of security
          </p>
        </div>
        <button
          type="button"
          className={CLASS_BUTTON_SECONDARY}
          aria-label="Enable two-factor authentication"
          disabled
        >
          Enable (coming soon)
        </button>
      </li>
      <li className={CLASS_LIST_ROW}>
        <div>
          <p className="font-medium text-white">Email Address</p>
          <p className="mt-0.5 text-sm text-screenriot-muted">
            {profile.email}
          </p>
        </div>
        {profile.identityLocked ? (
          <p className="mt-2 text-xs text-screenriot-muted">
            Email cannot be changed after identity verification.
          </p>
        ) : emailFormOpen ? (
          <form onSubmit={handleRequestChangeEmail} className="mt-3 space-y-2">
            <label htmlFor="new-email" className="sr-only">
              New email address
            </label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email"
              required
              className="w-full max-w-xs rounded border border-white/20 bg-screenriot-bg px-3 py-1.5 text-sm text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={emailSubmitLoading}
                className="rounded bg-screenriot-accent-blue px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {emailSubmitLoading ? "Sending…" : "Send confirmation"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailFormOpen(false);
                  setEmailMessage(null);
                }}
                className={CLASS_BUTTON_SECONDARY}
              >
                Cancel
              </button>
            </div>
            {emailMessage && (
              <p
                className={`text-xs ${emailMessage.type === "success" ? "text-screenriot-accent-blue" : "text-red-400"}`}
                role="status"
              >
                {emailMessage.text}
              </p>
            )}
          </form>
        ) : (
          <button
            type="button"
            className={`mt-2 ${CLASS_BUTTON_SECONDARY}`}
            aria-label="Change email address"
            onClick={() => setEmailFormOpen(true)}
          >
            Change
          </button>
        )}
      </li>
    </ul>
  );
}

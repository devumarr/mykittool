"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useAuth } from "@/firebase";

export default function ResetPasswordPage() {
  const auth = useAuth();
  const params = useSearchParams();
  const oobCode = params.get("oobCode") || "";

  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!auth || !oobCode) {
        setError("This reset link is invalid.");
        return;
      }
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setReady(true);
      } catch {
        setError("This reset link is invalid or expired.");
      }
    };
    run();
  }, [auth, oobCode]);

  const handleSave = async () => {
    setError("");
    if (pass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pass !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!auth || !oobCode) return;
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, pass);
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Could not change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border p-6 text-center">
        {done ? (
          <>
            <h1 className="text-2xl font-bold">Congratulations</h1>
            <p className="mt-3 text-sm">Your password has been changed.</p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full rounded-xl bg-blue-600 text-white py-2"
            >
              Go to login page
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Set new password</h1>
            {!ready && !error && (
              <p className="mt-4 text-sm">Checking link...</p>
            )}
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            {ready && !error && (
              <>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="New password"
                  className="mt-6 w-full rounded-xl border px-3 py-2"
                />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className="mt-3 w-full rounded-xl border px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="mt-4 w-full rounded-xl bg-blue-600 text-white py-2"
                >
                  {loading ? "Saving..." : "Change password"}
                </button>
              </>
            )}
            <Link href="/login" className="mt-6 block text-sm text-blue-500">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

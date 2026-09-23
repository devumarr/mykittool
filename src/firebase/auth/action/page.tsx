"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { useAuth } from "@/firebase";

export default function AuthActionPage() {
  const auth = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState("Checking link...");

  useEffect(() => {
    if (!auth) return;

    const mode = params.get("mode");
    const code = params.get("oobCode");

    if (!mode || !code) {
      setMsg("Invalid or expired link.");
      return;
    }

    if (mode === "verifyEmail") {
      applyActionCode(auth, code)
        .then(() => setMsg("Email verified. You can sign in now."))
        .catch(() => setMsg("This link is invalid or already used."));
      return;
    }

    setMsg("This link type is not supported yet.");
  }, [auth, params]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-3">My Kit Tool</h1>
      <p className="mb-6">{msg}</p>
      <button onClick={() => router.push("/login")}>Go to login</button>
    </div>
  );
}

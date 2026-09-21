"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `https://airesume-1-110s.onrender.com/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Password changed successfully");
        router.push("/login");
      } else {
        alert(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#000000",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "rgba(23,23,23,0.5)",
          padding: "30px",
          borderRadius: "16px",
          color: "white",
          textAlign: "center",
          border: "1px solid #262626",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.025em", color: "white" }}>
            NK<span style={{ color: "#a3a3a3" }}>Stech</span>
          </span>
        </Link>
        <h2 style={{ fontSize: "20px", marginTop: "16px" }}>Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "90%",
            padding: "12px",
            marginTop: "16px",
            borderRadius: "8px",
            border: "1px solid #404040",
            background: "#171717",
            color: "white",
          }}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            width: "90%",
            padding: "12px",
            marginTop: "12px",
            borderRadius: "8px",
            border: "1px solid #404040",
            background: "#171717",
            color: "white",
          }}
        />

        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            borderRadius: "8px",
            border: "none",
            background: "white",
            color: "black",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
      <p style={{ color: "#525252", fontSize: "12px", marginTop: "32px" }}>
        Created by NKStech
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#000000", color: "white" }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

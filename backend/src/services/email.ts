const BREVO_API = "https://api.brevo.com/v3/smtp/email";

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const response = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: {
        name: "ResumeIQ AI",
        email: "kumarnitin7970@gmail.com",
      },
      to: [
        {
          email,
          name,
        },
      ],
      subject: "Verify your ResumeIQ AI account",
      htmlContent: `
        <h2>Welcome ${name}</h2>
        <p>Please verify your email.</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  console.log("✅ Verification email sent");
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const response = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: {
        name: "ResumeIQ AI",
        email: "kumarnitin7970@gmail.com",
      },
      to: [
        {
          email,
          name,
        },
      ],
      subject: "Reset your ResumeIQ AI Password",
      htmlContent: `
        <h2>Password Reset</h2>

        <p>Hello ${name}</p>

        <p>Click below to reset your password.</p>

        <a href="${resetUrl}"
        style="background:#4f46e5;color:#fff;padding:12px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
        Reset Password
        </a>

        <p>This link expires in 1 hour.</p>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  console.log("✅ Password reset email sent");
};
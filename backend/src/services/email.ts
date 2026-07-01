const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP Error:", error);
  } else {
    console.log("✅ SMTP Server is ready");
  }
});

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify your ResumeIQ AI account",
      html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Welcome ${name}</h2>
        <p>Please verify your email.</p>
        <a href="${verifyUrl}">Verify Email</a>
      </div>
      `,
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (err) {
    console.error("❌ Verification Email Error:", err);
    throw err;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your ResumeIQ AI Password",
      html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Password Reset</h2>
        <p>Hello ${name},</p>
        <p>Click the button below to reset your password.</p>

        <a href="${resetUrl}"
        style="background:#4f46e5;color:#fff;padding:12px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
        Reset Password
        </a>

        <p>This link expires in 1 hour.</p>

        <p>If you didn't request this, ignore this email.</p>
      </div>
      `,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  } catch (err) {
    console.error("❌ Password Reset Email Error:", err);
    throw err;
  }
};
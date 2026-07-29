import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Gmail Verify Error:", error);
  } else {
    console.log("✅ Gmail Server is ready");
  }
});

export async function sendVerificationEmail(email, token) {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: `"SyncSpace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your SyncSpace account",
    html: `
      <h2>Welcome to SyncSpace</h2>
      <p>Click below to verify your email.</p>
      <a href="${url}">Verify Email</a>
    `,
  });

  console.log("✅ Email sent:", info.response);
}
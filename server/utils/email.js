import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const emailUser = process.env.EMAIL_USER || process.env.EMAIL;
const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

transporter.verify(function (error) {
  if (error) {
    console.error("❌ Gmail Verify Error:", error);
  } else {
    console.log("✅ Gmail Server is ready");
  }
});

export async function sendVerificationEmail(email, token) {
  if (!emailUser || !emailPass) {
    throw new Error("Gmail credentials are missing. Set EMAIL_USER/EMAIL_PASS or EMAIL/EMAIL_PASSWORD in server/.env.");
  }

  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: `"SyncSpace" <${emailUser}>`,
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
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();

// Simple config: Port 3000 and Gmail creds
const PORT = process.env.PORT || 3000;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const TO_EMAIL = process.env.TO_EMAIL || SMTP_USER;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

// Minimal middlewares
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Straightforward contact endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!SMTP_USER || !SMTP_PASS) {
    return res.status(500).json({ message: 'SMTP not configured' });
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `[Portfolio] ${String(subject)}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject}</p><pre>${message}</pre>`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('mail send error', err);
    res.status(500).json({ message: 'Mail send failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});



import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SUPPORT_SMTP_HOST,
  port: Number(process.env.SUPPORT_SMTP_PORT) || 587,
  secure: Number(process.env.SUPPORT_SMTP_PORT) === 465,
  auth: {
    user: process.env.SUPPORT_SMTP_USER,
    pass: process.env.SUPPORT_SMTP_PASS,
  },
});

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const sendContact = async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanSubject = String(subject).trim();
    const cleanMessage = String(message).trim();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (
      !cleanName ||
      !cleanSubject ||
      !cleanMessage
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (
      !process.env.SUPPORT_SMTP_HOST ||
      !process.env.SUPPORT_SMTP_USER ||
      !process.env.SUPPORT_SMTP_PASS
    ) {
      console.error(
        "SUPPORT SMTP environment variables are missing."
      );

      return res.status(500).json({
        success: false,
        message: "Email service is not configured.",
      });
    }

    await transporter.verify();

    await transporter.sendMail({
      from:
        process.env.SUPPORT_SMTP_FROM ||
        process.env.SUPPORT_SMTP_USER,

      to: process.env.SUPPORT_SMTP_USER,

      replyTo: cleanEmail,

      subject:
        `CodeX Support: ${cleanSubject}`,

      text: `
NEW CODEX SUPPORT MESSAGE

Name:
${cleanName}

Email:
${cleanEmail}

Subject:
${cleanSubject}

Message:
${cleanMessage}
      `.trim(),

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 700px;
          margin: 0 auto;
          padding: 24px;
          background: #f8fafc;
          color: #0f172a;
        ">

          <div style="
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 24px;
          ">

            <h2 style="
              margin: 0 0 8px;
              font-size: 22px;
            ">
              New CodeX Support Message
            </h2>

            <p style="
              margin: 0 0 22px;
              color: #64748b;
              font-size: 14px;
            ">
              A new message has been submitted through
              the CodeX contact form.
            </p>

            <div style="
              padding: 16px;
              background: #f8fafc;
              border-radius: 10px;
              border: 1px solid #e2e8f0;
            ">

              <p>
                <strong>Name:</strong><br>
                ${escapeHtml(cleanName)}
              </p>

              <p>
                <strong>Email:</strong><br>
                ${escapeHtml(cleanEmail)}
              </p>

              <p style="margin-bottom: 0;">
                <strong>Subject:</strong><br>
                ${escapeHtml(cleanSubject)}
              </p>

            </div>

            <div style="
              margin-top: 16px;
              padding: 16px;
              background: #eef2ff;
              border-radius: 10px;
              border: 1px solid #c7d2fe;
            ">

              <strong>Message</strong>

              <p style="
                margin: 10px 0 0;
                white-space: pre-wrap;
                line-height: 1.6;
              ">
                ${escapeHtml(cleanMessage)}
              </p>

            </div>

          </div>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error(
      "SUPPORT SMTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send your message right now. Please try again.",
    });
  }
};
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

export const sendContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    await transporter.verify();

    await transporter.sendMail({
      from:
        process.env.SUPPORT_SMTP_FROM ||
        process.env.SUPPORT_SMTP_USER,

      to: process.env.SUPPORT_SMTP_USER,

      replyTo: email,

      subject: `CodeX Support: ${subject}`,

      text: `
New Support Message

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `.trim(),

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 700px;
          margin: auto;
          padding: 25px;
          color: #222;
        ">

          <h2 style="margin-bottom: 25px;">
            New CodeX Support Message
          </h2>

          <p>
            <strong>Name:</strong> ${name}
          </p>

          <p>
            <strong>Email:</strong> ${email}
          </p>

          <p>
            <strong>Subject:</strong> ${subject}
          </p>

          <div style="
            margin-top: 20px;
            padding: 18px;
            background: #f5f5f5;
            border-radius: 10px;
          ">
            <strong>Message:</strong>

            <p style="
              margin-top: 10px;
              white-space: pre-wrap;
            ">
              ${message}
            </p>
          </div>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("SUPPORT SMTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Email sending failed",
    });
  }
};
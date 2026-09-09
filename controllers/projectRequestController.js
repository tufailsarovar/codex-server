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

export const sendProjectRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      projectName,
      requestType,
      techStack,
      otherTech,
      requirements,
    } = req.body;

    if (
      !name ||
      !email ||
      !mobile ||
      !requestType ||
      !techStack ||
      !requirements
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanMobile = String(mobile).trim();

    const cleanProjectName = String(
      projectName || "Not specified"
    ).trim();

    const cleanRequestType = String(
      requestType
    ).trim();

    const cleanTechStack = String(
      techStack
    ).trim();

    const cleanOtherTech = String(
      otherTech || ""
    ).trim();

    const cleanRequirements = String(
      requirements
    ).trim();

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
      !cleanEmail ||
      !cleanMobile ||
      !cleanRequestType ||
      !cleanTechStack ||
      !cleanRequirements
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    if (
      cleanTechStack === "Other" &&
      !cleanOtherTech
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter your required technology.",
      });
    }

    const finalTechStack =
      cleanTechStack === "Other"
        ? cleanOtherTech
        : cleanTechStack;

    await transporter.verify();

    await transporter.sendMail({
      from:
        process.env.SUPPORT_SMTP_FROM ||
        process.env.SUPPORT_SMTP_USER,

      to: process.env.SUPPORT_SMTP_USER,

      replyTo: cleanEmail,

      subject: `New Project Request - ${cleanRequestType}`,

      text: `
NEW CODEX PROJECT REQUEST

Student Name:
${cleanName}

Student Email:
${cleanEmail}

Mobile Number:
${cleanMobile}

Project:
${cleanProjectName}

What They Need:
${cleanRequestType}

Technology / Tech Stack:
${finalTechStack}

Requirements:
${cleanRequirements}
      `.trim(),

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
          background: #f8fafc;
          color: #0f172a;
        ">

          <div style="
            background: #ffffff;
            border-radius: 14px;
            padding: 24px;
            border: 1px solid #e2e8f0;
          ">

            <h2 style="
              margin: 0 0 8px;
              font-size: 22px;
            ">
              New Project Request
            </h2>

            <p style="
              margin: 0 0 20px;
              color: #64748b;
              font-size: 14px;
            ">
              A student has submitted a new request through CodeX.
            </p>

            <div style="
              padding: 16px;
              background: #f8fafc;
              border-radius: 10px;
              margin-bottom: 14px;
            ">

              <p>
                <strong>Student Name:</strong><br>
                ${escapeHtml(cleanName)}
              </p>

              <p>
                <strong>Student Email:</strong><br>
                ${escapeHtml(cleanEmail)}
              </p>

              <p>
                <strong>Mobile Number:</strong><br>
                ${escapeHtml(cleanMobile)}
              </p>

              <p>
                <strong>Project:</strong><br>
                ${escapeHtml(cleanProjectName)}
              </p>

              <p>
                <strong>What They Need:</strong><br>
                ${escapeHtml(cleanRequestType)}
              </p>

              <p style="margin-bottom: 0;">
                <strong>Technology / Tech Stack:</strong><br>
                ${escapeHtml(finalTechStack)}
              </p>

            </div>

            <div style="
              padding: 16px;
              background: #eef2ff;
              border-radius: 10px;
              border: 1px solid #c7d2fe;
            ">

              <strong>Student Requirements</strong>

              <p style="
                margin: 10px 0 0;
                white-space: pre-wrap;
                line-height: 1.6;
              ">
                ${escapeHtml(cleanRequirements)}
              </p>

            </div>

          </div>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message:
        "Your project request has been sent successfully.",
    });
  } catch (error) {
    console.error(
      "PROJECT REQUEST SMTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send your request right now. Please try again.",
    });
  }
};
import crypto from "crypto";
import nodemailer from "nodemailer";

import { razorpay } from "../config/razorpay.js";
import AktuOrder from "../models/AktuOrder.js";
import AktuResource from "../models/AKTUResource.js";

/* =========================================================
   CREATE AKTU PAYMENT ORDER
========================================================= */

export const createAktuPaymentOrder = async (
  req,
  res
) => {
  try {
    const { resourceId } =
      req.body;

    /* -----------------------------------------
       LOGIN REQUIRED
    ----------------------------------------- */

    if (!req.user) {
      return res.status(401).json({
        message:
          "Please login before purchasing.",
      });
    }

    /* -----------------------------------------
       RESOURCE ID
    ----------------------------------------- */

    if (!resourceId) {
      return res.status(400).json({
        message:
          "Resource ID is required.",
      });
    }

    /* -----------------------------------------
       FIND RESOURCE
    ----------------------------------------- */

    const resource =
      await AktuResource.findOne({
        _id: resourceId,
        isPublished: true,
      });

    if (!resource) {
      return res.status(404).json({
        message:
          "AKTU resource not found.",
      });
    }

    /* -----------------------------------------
       SYLLABUS IS FREE
    ----------------------------------------- */

    if (
      resource.resourceType ===
        "syllabus" ||
      resource.accessType ===
        "free" ||
      Number(resource.price) <= 0
    ) {
      return res.status(400).json({
        message:
          "This resource is free and does not require payment.",
      });
    }

    /* -----------------------------------------
       VALIDATE PRICE
    ----------------------------------------- */

    const amount =
      Number(resource.price);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        message:
          "Invalid resource price.",
      });
    }

    /* -----------------------------------------
       CREATE RAZORPAY ORDER
    ----------------------------------------- */

    const razorpayOrder =
      await razorpay.orders.create({
        amount:
          Math.round(amount * 100),

        currency: "INR",

        receipt:
          `aktu_${Date.now()}`,

        notes: {
          resourceId:
            resource._id.toString(),

          userId:
            req.user._id.toString(),

          resourceType:
            resource.resourceType,

          branch:
            resource.branch,

          academicYear:
            String(
              resource.academicYear
            ),
        },
      });

    /* -----------------------------------------
       RESPONSE
    ----------------------------------------- */

    return res.status(200).json({
      success: true,

      order: razorpayOrder,

      key:
        process.env
          .RAZORPAY_KEY_ID,

      resource: {
        _id:
          resource._id,

        branch:
          resource.branch,

        academicYear:
          resource.academicYear,

        resourceType:
          resource.resourceType,

        unit:
          resource.unit,

        description:
          resource.description,

        imageUrl:
          resource.imageUrl,

        fileUrl:
          resource.fileUrl,

        price:
          amount,
      },
    });
  } catch (error) {
    console.error(
      "Create AKTU payment order error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create payment order.",
    });
  }
};


/* =========================================================
   VERIFY AKTU PAYMENT
========================================================= */

export const verifyAktuPayment = async (
  req,
  res
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      resourceId,
    } = req.body;

    /* -----------------------------------------
       LOGIN REQUIRED
    ----------------------------------------- */

    if (!req.user) {
      return res.status(401).json({
        message:
          "Please login before purchasing.",
      });
    }

    /* -----------------------------------------
       REQUIRED DATA
    ----------------------------------------- */

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !resourceId
    ) {
      return res.status(400).json({
        message:
          "Payment verification data is incomplete.",
      });
    }

    /* -----------------------------------------
       FIND RESOURCE
    ----------------------------------------- */

    const resource =
      await AktuResource.findOne({
        _id: resourceId,
        isPublished: true,
      });

    if (!resource) {
      return res.status(404).json({
        message:
          "AKTU resource not found.",
      });
    }

    /* -----------------------------------------
       FREE RESOURCE CHECK
    ----------------------------------------- */

    if (
      resource.resourceType ===
        "syllabus" ||
      resource.accessType ===
        "free" ||
      Number(resource.price) <= 0
    ) {
      return res.status(400).json({
        message:
          "This resource does not require payment.",
      });
    }

    /* -----------------------------------------
       VERIFY RAZORPAY SIGNATURE
    ----------------------------------------- */

    const sign =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_KEY_SECRET
        )
        .update(sign)
        .digest("hex");

    if (
      expectedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        message:
          "Payment verification failed.",
      });
    }

    /* -----------------------------------------
       GET RAZORPAY ORDER
       SERVER-SIDE AMOUNT CHECK
    ----------------------------------------- */

    const razorpayOrder =
      await razorpay.orders.fetch(
        razorpay_order_id
      );

    const expectedAmount =
      Math.round(
        Number(resource.price) *
          100
      );

    if (
      Number(
        razorpayOrder.amount
      ) !== expectedAmount
    ) {
      return res.status(400).json({
        message:
          "Payment amount mismatch.",
      });
    }

    /* -----------------------------------------
       CHECK ORDER BELONGS TO USER
    ----------------------------------------- */

    if (
      razorpayOrder.notes
        ?.userId &&
      razorpayOrder.notes
        .userId !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Payment user mismatch.",
      });
    }

    /* -----------------------------------------
       CHECK RESOURCE MATCH
    ----------------------------------------- */

    if (
      razorpayOrder.notes
        ?.resourceId &&
      razorpayOrder.notes
        .resourceId !==
        resource._id.toString()
    ) {
      return res.status(400).json({
        message:
          "Payment resource mismatch.",
      });
    }

    /* -----------------------------------------
       PREVENT DUPLICATE PAYMENT
    ----------------------------------------- */

    const existingOrder =
      await AktuOrder.findOne({
        paymentId:
          razorpay_payment_id,
      });

    if (existingOrder) {
      return res.status(200).json({
        success: true,

        alreadyProcessed:
          true,

        message:
          "Payment has already been verified.",

        email:
          req.user.email,

        paymentId:
          razorpay_payment_id,
      });
    }

    /* -----------------------------------------
       SAVE AKTU ORDER
    ----------------------------------------- */

    const aktuOrder =
      await AktuOrder.create({
        user:
          req.user._id,

        resource:
          resource._id,

        amount:
          Number(resource.price),

        paymentStatus:
          "paid",

        paymentProvider:
          "razorpay",

        paymentId:
          razorpay_payment_id,

        razorpayOrderId:
          razorpay_order_id,

        emailSent:
          false,
      });

    /* -----------------------------------------
       PDF LINK REQUIRED
    ----------------------------------------- */

    if (
      !resource.fileUrl
    ) {
      console.error(
        "AKTU payment successful but PDF link is missing."
      );

      return res.status(500).json({
        success: false,

        paymentSuccess:
          true,

        message:
          "Payment successful, but the PDF link is missing. Please contact support.",
      });
    }

    /* -----------------------------------------
       SMTP TRANSPORTER
    ----------------------------------------- */

    const transporter =
      nodemailer.createTransport({
        host:
          process.env
            .SMTP_HOST,

        port:
          Number(
            process.env
              .SMTP_PORT
          ),

        secure:
          Number(
            process.env
              .SMTP_PORT
          ) === 465,

        auth: {
          user:
            process.env
              .SMTP_USER,

          pass:
            process.env
              .SMTP_PASS,
        },
      });

    /* -----------------------------------------
       ACADEMIC YEAR
    ----------------------------------------- */

    const yearMap = {
      1: "1st Year",
      2: "2nd Year",
      3: "3rd Year",
      4: "4th Year",
    };

    const academicYear =
      yearMap[
        Number(
          resource.academicYear
        )
      ] ||
      `${resource.academicYear} Year`;

    /* -----------------------------------------
       RESOURCE NAME
    ----------------------------------------- */

    const resourceName =
      resource.description ||
      resource.resourceType;

    /* -----------------------------------------
       SEND EMAIL
    ----------------------------------------- */

    try {
      await transporter.sendMail({
        from:
          process.env
            .SMTP_FROM,

        to:
          req.user.email,

        subject:
          `CodeX - ${resourceName} Purchase Successful`,

        html: `
<!DOCTYPE html>

<html>
<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<title>
  CodeX Purchase Successful
</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;
    color:#0f172a;
  "
>

<div
  style="
    max-width:650px;
    margin:30px auto;
    background:#ffffff;
    border-radius:16px;
    overflow:hidden;
  "
>

  <!-- HEADER -->

  <div
    style="
      background:#4f46e5;
      padding:30px 20px;
      text-align:center;
    "
  >

    <h1
      style="
        margin:0;
        color:#ffffff;
        font-size:28px;
      "
    >
      CodeX
    </h1>

    <p
      style="
        margin:8px 0 0;
        color:#e0e7ff;
      "
    >
      AKTU Study Material
    </p>

  </div>

  <!-- BODY -->

  <div
    style="
      padding:30px 25px;
    "
  >

    <h2
      style="
        margin-top:0;
        color:#16a34a;
      "
    >
      Payment Successful ✓
    </h2>

    <p>
      Hello
      <strong>
        ${
          req.user.name ||
          "Student"
        }
      </strong>,
    </p>

    <p>
      Your payment has been successfully
      verified. Your AKTU study material
      is now ready to download.
    </p>

    <!-- RESOURCE DETAILS -->

    <div
      style="
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:12px;
        padding:20px;
        margin:25px 0;
      "
    >

      <p>
        <strong>
          Branch:
        </strong>
        ${resource.branch}
      </p>

      <p>
        <strong>
          Academic Year:
        </strong>
        ${academicYear}
      </p>

      <p>
        <strong>
          Resource Type:
        </strong>
        ${resource.resourceType}
      </p>

      ${
        resource.unit
          ? `
          <p>
            <strong>
              Unit:
            </strong>
            ${resource.unit}
          </p>
          `
          : ""
      }

      ${
        resource.description
          ? `
          <p>
            <strong>
              Description:
            </strong>
            ${resource.description}
          </p>
          `
          : ""
      }

      <p>
        <strong>
          Amount Paid:
        </strong>
        ₹${Number(
          resource.price
        ).toFixed(2)}
      </p>

      <p>
        <strong>
          Payment ID:
        </strong>
        ${razorpay_payment_id}
      </p>

    </div>

    <!-- DOWNLOAD BUTTON -->

    <div
      style="
        text-align:center;
        margin:30px 0;
      "
    >

      <a
        href="${resource.fileUrl}"
        target="_blank"
        style="
          display:inline-block;
          background:#4f46e5;
          color:#ffffff;
          text-decoration:none;
          padding:15px 30px;
          border-radius:10px;
          font-weight:bold;
          font-size:16px;
        "
      >
        📄 Download PDF
      </a>

    </div>

    <p
      style="
        font-size:13px;
        color:#64748b;
        line-height:1.6;
      "
    >
      This download link points to the PDF
      provided by CodeX. Please keep this
      email for your records.
    </p>

    <p>
      Thank you for purchasing from
      <strong>
        CodeX
      </strong>.
    </p>

  </div>

  <!-- FOOTER -->

  <div
    style="
      background:#f8fafc;
      border-top:1px solid #e2e8f0;
      padding:20px;
      text-align:center;
    "
  >

    <p
      style="
        margin:0;
        color:#64748b;
        font-size:12px;
      "
    >
      © 2026 CodeX. All rights reserved.
    </p>

    <p
      style="
        margin:6px 0 0;
        color:#94a3b8;
        font-size:12px;
      "
    >
      CodeX | Tufail Sarovar
    </p>

  </div>

</div>

</body>
</html>
        `,
      });

      /* -------------------------------------
         MARK EMAIL SENT
      ------------------------------------- */

      aktuOrder.emailSent =
        true;

      aktuOrder.emailSentAt =
        new Date();

      await aktuOrder.save();

      return res.status(200).json({
        success: true,

        paymentSuccess:
          true,

        emailSent:
          true,

        message:
          "Payment successful. PDF link has been sent to your registered email.",

        email:
          req.user.email,

        paymentId:
          razorpay_payment_id,

        orderId:
          aktuOrder._id,
      });
    } catch (emailError) {
      /*
       * Payment is already successful and
       * order is already saved.
       *
       * Do NOT mark payment as failed.
       */

      console.error(
        "AKTU payment email error:",
        emailError
      );

      return res.status(200).json({
        success: true,

        paymentSuccess:
          true,

        emailSent:
          false,

        message:
          "Payment successful, but the email could not be sent. Please contact support.",

        email:
          req.user.email,

        paymentId:
          razorpay_payment_id,

        orderId:
          aktuOrder._id,
      });
    }
  } catch (error) {
    console.error(
      "Verify AKTU payment error:",
      error
    );

    return res.status(500).json({
      message:
        "Payment verification failed.",
    });
  }
};
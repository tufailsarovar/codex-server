# 🚀 MERN Stack Project – Setup & Usage Guide

This project is developed using the MERN Stack (MongoDB, Express, React, Node.js).
For security reasons, sensitive configuration values are not included directly.

---

## 🔐 Environment Configuration (Very Important)

⚠️ The `.env` file is intentionally NOT included to protect sensitive data.

You must create your own `.env` files using the provided `.env.example` files.

---

## ✅ Backend Environment Setup

1. Copy `.env.example` and rename it to `.env`
2. Add your own credentials

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_here

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxx
SMTP_FROM="CodeX <abc@gmail.com>"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=example@gmail.com
SMTP_PASS=your_app_password
```

---

## ✅ Frontend Environment Setup

```env
VITE_API_URL=http://localhost:5173/api
VITE_EMAILJS_SERVICE_ID=service_rotrhvs
VITE_EMAILJS_TEMPLATE_ID=template_idghdif
VITE_EMAILJS_PUBLIC_KEY=aruhriguhvaiur
```

⚠️ All frontend environment variables must start with `VITE_`.

---

## ▶️ How to Run the Project

Backend:
```
npm install
npm run dev
```

Frontend:
Code:- https://github.com/tufailsarovar/CodeX
```
npm install
npm run dev
```

---

## 🔒 Security Best Practices

- Never upload your real `.env` file
- Never hard-code secrets
- Always use `.env.example` when sharing or selling projects

---

DEMO:- https://www.projectcodex.in/ 
LinkedIn:- https://www.linkedin.com/in/tufailsarovar/

Happy Coding 🚀

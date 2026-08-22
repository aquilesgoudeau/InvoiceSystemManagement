Invoice System Management (ISM) 📊📱

A full-stack, cross-platform mobile business management and invoicing platform built with React Native (Expo) and a scalable Node.js / Express backend hosted on AWS EC2.

ISM automates end-to-end invoice lifecycles, offering multi-provider federated authentication, multimodal OCR receipt parsing via Gemini AI, automated email distribution via MailerSend, and financial data reporting.

🏗 System Architecture

┌────────────────────────────────────────────────────────┐
│               ISM Mobile Client (Expo/RN)              │
│  - React Native 0.86 + React 19                        │
│  - Multi-Provider Auth (Apple Sign-In / Google OAuth)  │
│  - Document Scanner + Gemini Vision OCR                │
│  - Financial Charts & Native Document Export (ExcelJS) │
└───────────────────────────┬────────────────────────────┘
                            │ REST APIs / Secure Tokens
                            ▼
┌────────────────────────────────────────────────────────┐
│            ISM Backend Service (Node.js/Express)       │
│  - Hosted on AWS EC2 Infrastructure                    │
│  - MongoDB Atlas Database                              │
│  - MailerSend Transactional Email Service              │
│  - Secure Token Verification & JWT Sessions            │
└────────────────────────────────────────────────────────┘

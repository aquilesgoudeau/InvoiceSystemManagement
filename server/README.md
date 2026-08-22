# ISM Server 🖥️

The backend service for **Invoice System Management (ISM)** — a Node.js / Express REST API handling authentication, invoice data, AI-powered receipt parsing, and automated email reporting for the ISM mobile client.

Deployed on **AWS EC2**, using **MongoDB** for persistence and the **Google Gemini API** for multimodal OCR extraction from scanned receipts.

---

## 🏗 Architecture & Technical Patterns

* **ES Modules Native:** The project runs on native ESM (`"type": "module"`), with all local relative imports explicitly including the `.js` extension.
* **Centralized Configuration:** Environment variables are never accessed directly via `process.env` in services or routes — everything flows through `src/config/keys.js`, which exports a single `protectedKeys` object.
* **Structured AI Extraction:** Receipt parsing (`analyzeReceip`) uses the Gemini API (`gemini-2.5-flash`) with an explicit `responseSchema`, forcing the model to return valid structured JSON instead of relying on regex parsing.
* **Multi-Provider Authentication:** JWT-based sessions issued after verifying identity tokens from both Apple Sign-In and Google Sign-In (via `apple-signin-auth` and `google-auth-library`).
* **Automated Reporting:** Server-side CSV generation and transactional email delivery via the MailerSend API.
* **Fail-Safe Startup:** The server refuses to run without a working database connection — if MongoDB fails to connect outside of a test environment, the process exits (`process.exit(1)`) instead of running degraded.

---

## 📁 Project Directory Structure

```text
server/
├── __tests__/            # Unit & integration tests (Jest + Supertest)
├── src/
│   ├── config/           # Centralized environment variable configuration
│   │   └── keys.js
│   ├── middleware/       # Express middleware (auth, validation, etc.)
│   │   └── authMiddleware.js
│   ├── models/           # Mongoose models (User, etc.)
│   │   └── User.js
│   ├── routes/           # Express routers grouped by domain
│   │   ├── authRoutes.js
│   │   ├── reportsRoutes.js
│   │   └── scanRoutes.js
│   ├── services/         # Business logic & external service integrations
│   │   ├── db.js         # MongoDB connection
│   │   ├── gemini.js     # Gemini AI integration for receipt scanning
│   │   └── reports.js    # Report generation logic
│   └── index.js          # Application entry point
├── package.json
└── jest.config.js
```

---

## 🧪 Automated Testing & Code Quality

The project runs Jest in native ES Modules mode (`--experimental-vm-modules`), with Supertest for API integration testing. External services (Gemini, email, MongoDB) are always mocked — no real network calls happen in the test suite.

```bash
# Run the full test suite
npm test

# Run tests and generate a coverage report
npm run test:report
```

---

## ⚙️ Tech Stack & Key Libraries

| Category | Libraries & Tools |
| :--- | :--- |
| **Runtime & Server** | Node.js (ESM), Express.js 5+ |
| **Database** | MongoDB, Mongoose |
| **AI / OCR** | `@google/genai` (Gemini `gemini-2.5-flash`) |
| **Authentication** | `jsonwebtoken`, `apple-signin-auth`, `google-auth-library` |
| **Email Delivery** | MailerSend |
| **Testing** | Jest, Supertest |

---

## 🚀 Local Development Setup

### Prerequisites

* Node.js (v18+ recommended)
* A MongoDB connection string (local or Atlas)
* API credentials for Gemini, Google/Apple Sign-In, and MailerSend

### Installation & Execution

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root with the required environment variables (see `src/config/keys.js` for the full list expected).

Run the server in development mode:

```bash
npm run server
```

---

## 📦 Deployment

The API is deployed on **AWS EC2**, running behind the same domain consumed by the ISM mobile client for authentication, invoice reporting, and AI-powered receipt scanning.
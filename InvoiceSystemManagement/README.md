# ISM Mobile Client 📱

A cross-platform mobile invoicing and financial management application built with **React Native (0.86.2)**, **React 19**, and **Expo SDK 57**.

The mobile client uses an offline-first architecture powered by asynchronous SQLite, Tailwind CSS (NativeWind v4) styling, state management via Context API, and automated test suites using Jest.

---

## 🏗 Architecture & Technical Patterns

* **Styling & Design System:** Utility-first styling via **NativeWind v4** / **Tailwind CSS**, eliminating inline stylesheets for responsive cross-platform layouts.
* **Offline-First Persistence:** Asynchronous local database management with `expo-sqlite`, using `openDatabaseAsync`, `runAsync`, `getAllAsync`, and PRAGMA `user_version` schema migrations.
* **State Management:** A predictable, boilerplate-free state layer using a custom `createDataContext` helper built on top of React Context and `useReducer`.
* **Navigation Architecture:** Static navigation via **React Navigation v7** (Native Stack & Bottom Tabs), paired with a root-level `navigationRef` for decoupled navigation flows.
* **Secure Authentication:** Multi-provider auth combining native Apple Sign-In (`expo-apple-authentication`) and Google Sign-In (`@react-native-google-signin/google-signin`), with tokens persisted securely via `expo-secure-store`.
* **Document Processing & Utilities:** Native receipt scanning (`react-native-document-scanner-plugin`), image manipulation (`expo-image-manipulator`), and Excel workbook generation (`exceljs`).

---

## 📁 Project Directory Structure

```text
/
├── App.js                         # Root entry point, providers & navigation container
├── app.json                       # Expo configuration & build properties
├── tailwind.config.js             # NativeWind & Tailwind CSS configuration
├── __tests__/                     # Test suite mirroring the src/ structure
│   ├── components/                # UI component rendering & interaction tests
│   ├── contexts/                  # Business logic, state & reducer tests
│   ├── db/                        # SQLite schema and migration test suites
│   ├── screens/                   # Screen integration tests
│   ├── services/                  # Axios API mock client tests
│   └── utils/                     # Formatters and chart calculation tests
└── src/
    ├── components/                # Reusable domain-driven UI components
    ├── contexts/                  # Global state providers (Auth, Scanner, Export, DateFilter)
    ├── db/                        # Async SQLite connection and query layer
    ├── hooks/                     # Custom lifecycle and utility hooks
    ├── navigation/                # Navigators and decoupled navigationRef
    ├── screens/                   # Main view containers and workflows
    ├── services/                  # Axios HTTP client configuration
    └── utils/                     # Data transformers, chart generators, and export helpers
```

---

## 🧪 Automated Testing & Code Quality

Code quality is enforced using Jest, Jest Expo, React Native Testing Library, and Jest Native.

```bash
# Run unit and integration tests
npm test

# Execute test suite and generate an interactive HTML coverage report
npm run test:report
```

Running `test:report` outputs a visual, interactive test and coverage report at `./test-report.html`.

---

## ⚙️ Tech Stack & Key Libraries

| Category | Libraries & Tools |
| :--- | :--- |
| **Framework & Core** | React Native 0.86.2, React 19.2.3, Expo SDK 57, Babel |
| **UI & Styling** | NativeWind 4.2.6, Tailwind CSS 3.4.17, Lucide Icons, React Native SVG |
| **Navigation** | React Navigation 7 (Native Stack, Bottom Tabs), Reanimated, Screens |
| **Local Storage** | `expo-sqlite`, `expo-secure-store`, `expo-file-system` |
| **Authentication** | `@react-native-google-signin/google-signin`, `expo-apple-authentication`, `expo-auth-session` |
| **Data & Charts** | `react-native-gifted-charts`, `react-native-pie-chart`, `exceljs`, `react-native-calendars` |
| **Testing** | `jest`, `jest-expo`, `@testing-library/react-native`, `jest-html-reporter` |

---

## 🚀 Local Development Setup

### Prerequisites

* Node.js (v18+ recommended)
* Android Studio (with Android SDK configured) or Xcode (macOS only)

### Installation & Execution

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

Run on native platforms:

```bash
# Android emulator / connected device
npm run android

# iOS simulator / connected device
npm run ios
```

---

## 📦 Native Build & Release Pipelines

* **Android (Gradle):** Compiled locally via Android Studio / Gradle CLI, producing signed Android App Bundles (`.aab`) and `.apk` binaries for Google Play Console (Internal Testing).
* **iOS (Xcode):** Built and archived locally via Xcode using distribution certificates and provisioning profiles for Apple App Store Connect / TestFlight.
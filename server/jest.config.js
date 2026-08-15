export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/__tests__/**/*.test.js"],
  reporters: [
    "default",
    ["jest-html-reporter", {
      pageTitle: "API Test Report",
      outputPath: "./test-report.html",
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"]
};

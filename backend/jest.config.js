/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/__tests__"],
  clearMocks: true,
  restoreMocks: true,
  moduleFileExtensions: ["ts", "js", "json"],
};

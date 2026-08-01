import { defineConfig } from "allure";

export default defineConfig({
  name: "SixProperty Admin — Playwright Report",
  output: "./allure-report",
  historyPath: "./allure-history/history.jsonl",
});

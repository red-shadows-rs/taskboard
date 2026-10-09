import { describe, expect, it } from "vitest";

import {
  detectScript,
  resolvePlan,
  stripHtmlToText,
} from "@/utils/textScriptUtil";

describe("textScriptUtil", () => {
  it("detects arabic text", () => {
    expect(detectScript("مرحبا بالعالم")).toBe("ar");
  });

  it("detects latin text", () => {
    expect(detectScript("Hello world")).toBe("en");
  });

  it("treats digits only as mixed", () => {
    expect(detectScript("12345")).toBe("mixed");
  });

  it("plans translation when the script matches the ui language", () => {
    expect(resolvePlan("مرحبا", "ar")).toEqual({
      translate: true,
      from: "ar",
      to: "en",
    });
    expect(resolvePlan("Hello", "en")).toEqual({
      translate: true,
      from: "en",
      to: "ar",
    });
  });

  it("does not translate when the script differs from the ui language", () => {
    expect(resolvePlan("Hello", "ar")).toEqual({
      translate: false,
      from: "ar",
      to: "ar",
    });
  });

  it("strips html to plain text", () => {
    expect(stripHtmlToText("<p>Hi&nbsp;there</p>")).toBe("Hi there");
  });
});

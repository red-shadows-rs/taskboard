import { describe, expect, it } from "vitest";

import { checkRateLimit } from "@/app/api/shared/rateLimitShared";

function fakeRequest(headers: Record<string, string>) {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as Parameters<typeof checkRateLimit>[0];
}

describe("rateLimitShared", () => {
  it("blocks after the configured number of requests", () => {
    const request = fakeRequest({});
    let allowed = true;
    for (let i = 0; i < 4; i++) {
      allowed = checkRateLimit(request, "test:block", 3, 60000).allowed;
    }
    expect(allowed).toBe(false);
  });

  it("does not trust x-real-ip when TRUST_PROXY is unset", () => {
    const original = process.env.TRUST_PROXY;
    delete process.env.TRUST_PROXY;

    const first = fakeRequest({ "x-real-ip": "1.1.1.1" });
    const second = fakeRequest({ "x-real-ip": "2.2.2.2" });

    checkRateLimit(first, "test:ip", 1, 60000);
    const result = checkRateLimit(second, "test:ip", 1, 60000);

    expect(result.allowed).toBe(false);

    if (original === undefined) {
      delete process.env.TRUST_PROXY;
    } else {
      process.env.TRUST_PROXY = original;
    }
  });
});

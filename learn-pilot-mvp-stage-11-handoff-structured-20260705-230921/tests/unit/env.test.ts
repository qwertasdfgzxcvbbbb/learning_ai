import { describe, expect, it } from "vitest";
import { getEnv } from "@/lib/env";

describe("getEnv", () => {
  it("returns validated environment variables", () => {
    const env = getEnv({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/learn_pilot_mvp",
      NEXTAUTH_SECRET: "local-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      OPENAI_MODEL: "mock",
    });

    expect(env.OPENAI_MODEL).toBe("mock");
  });

  it("fails clearly when required variables are missing", () => {
    expect(() => getEnv({})).toThrow();
  });
});

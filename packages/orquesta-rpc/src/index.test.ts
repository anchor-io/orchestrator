import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.ts";

describe("@anchorsoft/orquesta-rpc", () => {
  it("exports PACKAGE_NAME", () => {
    expect.assertions(1);
    expect(PACKAGE_NAME).toBe("@anchorsoft/orquesta-rpc");
  });
});

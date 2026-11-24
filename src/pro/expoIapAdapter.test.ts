import { expoIapAdapter } from "./expoIapAdapter";

describe("the expo-iap adapter in Jest", () => {
  it("runs on the stub, never the native module, and answers nothing", async () => {
    await expect(expoIapAdapter.checkOwned()).resolves.toEqual({ kind: "no-answer" });
    await expect(expoIapAdapter.buy()).resolves.toEqual({ kind: "error" });
  });
});

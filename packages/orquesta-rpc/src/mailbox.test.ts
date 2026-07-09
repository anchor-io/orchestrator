import { describe, expect, it } from "vitest";
import { MailboxError, MailboxRuntime } from "./mailbox.ts";

describe("MailboxRuntime", () => {
  it("delivers channel messages to members other than the sender", () => {
    expect.assertions(5);
    const runtime = new MailboxRuntime({
      createId: () => "message-1",
      now: () => new Date("2026-07-07T00:00:00.000Z"),
    });
    runtime.configureAgent("reviewer-a", ["review-loop"]);
    runtime.configureAgent("reviewer-b", ["review-loop"]);

    const sent = runtime.sendMessage("review-loop", "reviewer-a", "Found auth issue");

    expect(sent).toEqual({
      message: {
        id: "message-1",
        channelId: "review-loop",
        fromAgentId: "reviewer-a",
        body: "Found auth issue",
        createdAt: "2026-07-07T00:00:00.000Z",
      },
      deliveredTo: ["reviewer-b"],
    });
    expect(runtime.listMessages("reviewer-a")).toEqual([]);
    expect(runtime.listMessages("reviewer-b")).toEqual([sent.message]);
    expect(runtime.ackMessages("reviewer-b", ["message-1"])).toEqual(["message-1"]);
    expect(runtime.listMessages("reviewer-b")).toEqual([]);
  });

  it("requires the sender to be a member of the channel", () => {
    expect.assertions(2);
    const runtime = new MailboxRuntime();
    runtime.configureAgent("reviewer-a", ["review-loop"]);

    try {
      runtime.sendMessage("review-loop", "reviewer-b", "hello");
    } catch (error) {
      expect(error).toBeInstanceOf(MailboxError);
      expect(error).toEqual(expect.objectContaining({ code: "agent_not_in_channel" }));
    }
  });
});

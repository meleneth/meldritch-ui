import { beforeEach, describe, expect, it, vi } from "vitest";
import { PerformanceSocket } from "./websocket";

class FakeWebSocket {
  static OPEN = 1;
  readyState = FakeWebSocket.OPEN;
  sent: string[] = [];
  onopen?: () => void;
  onmessage?: (event: { data: string }) => void;
  onclose?: () => void;
  onerror?: () => void;
  constructor(readonly url: string) {}
  send(message: string) {
    this.sent.push(message);
  }
  close() {}
}

describe("contract WebSocket negotiation", () => {
  let sockets: FakeWebSocket[];

  beforeEach(() => {
    sockets = [];
    vi.stubGlobal(
      "WebSocket",
      class extends FakeWebSocket {
        static OPEN = 1;
        constructor(url: string) {
          super(url);
          sockets.push(this);
        }
      },
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ websocket: "/performance", access_links: [] }),
      })),
    );
  });

  it("negotiates before sending authentication", async () => {
    const statuses: string[] = [];
    const socket = new PerformanceSocket(
      () => undefined,
      (status) => statuses.push(status),
      () => undefined,
      () => undefined,
      () => undefined,
    );
    await socket.connect("secret");
    sockets[0].onopen?.();
    expect(JSON.parse(sockets[0].sent[0])).toMatchObject({
      type: "hello",
      protocol: ">=1.0.0 <2.0.0",
      client: "meldritch-ui",
    });
    expect(sockets[0].sent).toHaveLength(1);

    sockets[0].onmessage?.({
      data: JSON.stringify({
        type: "hello.accepted",
        protocol: "1.0.0",
        schema_version: 3,
      }),
    });
    expect(JSON.parse(sockets[0].sent[1])).toEqual({
      type: "authenticate",
      token: "secret",
    });
    expect(statuses).toEqual(["negotiating", "connected"]);
  });
});

import type { AccessLink, Command, Snapshot } from "../types/protocol";
import { WEB_PROTOCOL_RANGE } from "../generated/protocol";

interface BrowserConfig {
  websocket: string | null;
  access_links?: AccessLink[];
}

function engineHttpBase(): string {
  return (import.meta.env.VITE_MELDRITCH_ENGINE_URL || "").replace(/\/$/, "");
}

function websocketUrl(path: string): string {
  const base = new URL(engineHttpBase() || window.location.origin);
  base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
  base.pathname = path;
  base.search = "";
  base.hash = "";
  return base.toString();
}

export class PerformanceSocket {
  private socket?: WebSocket;
  private retry?: number;
  private stopped = false;
  constructor(
    private onSnapshot: (s: Snapshot) => void,
    private onStatus: (s: string) => void,
    private onError: (e: string) => void,
    private onSession: (role: string | null) => void,
    private onAccessLinks: (links: AccessLink[]) => void,
  ) {}
  async connect(token: string) {
    this.stopped = false;
    const config: BrowserConfig = await fetch(
      `${engineHttpBase()}/api/browser-config`,
    ).then((response) => {
      if (!response.ok)
        throw new Error(`engine configuration: ${response.status}`);
      return response.json();
    });
    this.onAccessLinks(config.access_links || []);
    if (!config.websocket) {
      this.onError("WebSocket disabled");
      return;
    }
    this.socket = new WebSocket(websocketUrl(config.websocket));
    this.socket.onopen = () => {
      this.onStatus("negotiating");
      this.socket?.send(
        JSON.stringify({
          type: "hello",
          protocol: WEB_PROTOCOL_RANGE,
          client: "meldritch-ui",
        }),
      );
    };
    this.socket.onmessage = (e) => {
      const value = JSON.parse(e.data);
      if (value.type === "hello.accepted") {
        this.onStatus("connected");
        if (token)
          this.socket?.send(JSON.stringify({ type: "authenticate", token }));
      } else if (value.type === "protocol.incompatible") {
        this.stopped = true;
        this.onError(value.error);
        this.socket?.close();
      } else if (
        value.type === "state.snapshot" ||
        value.type === "state.updated"
      )
        this.onSnapshot(value);
      else if (value.type === "session") this.onSession(value.role);
      else if (value.type === "error") this.onError(value.error);
    };
    this.socket.onclose = () => {
      if (!this.stopped) {
        this.onStatus("reconnecting");
        this.retry = window.setTimeout(() => this.connect(token), 750);
      }
    };
    this.socket.onerror = () => this.onError("connection failed");
  }
  send(command: Command) {
    if (this.socket?.readyState === WebSocket.OPEN)
      this.socket.send(JSON.stringify(command));
    else this.onError("not connected");
  }
  close() {
    this.stopped = true;
    if (this.retry) clearTimeout(this.retry);
    this.socket?.close();
  }
}

import ReconnectingWebSocket from "reconnecting-websocket";

import { getWsBaseUrl } from "@/lib/utils";

const WS_BASE = getWsBaseUrl();

export function createBoardTasksSocket(boardId: string, token: string) {
  const url = `${WS_BASE}/boards/${boardId}/?token=${encodeURIComponent(token)}`;
  return new ReconnectingWebSocket(url);
}

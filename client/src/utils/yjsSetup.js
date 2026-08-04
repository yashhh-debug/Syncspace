import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export function createYjsProvider(roomId) {
  console.log("Creating provider for room:", roomId);

  const doc = new Y.Doc();

  const provider = new WebsocketProvider(
    "ws://localhost:1234",
    roomId,
    doc,
    { connect: true }
  );

  return {
    doc,
    provider,
    awareness: provider.awareness,
    destroy: () => {
      provider.destroy();
      doc.destroy();
    },
  };
}
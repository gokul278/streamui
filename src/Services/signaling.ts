// src/services/signaling.ts
export const connectSignaling = (id: string) => {
  const ws = new WebSocket(`http://172.20.10.3:8080/ws/roomId=${id}`);
  return ws;
};

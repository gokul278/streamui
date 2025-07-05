// src/services/signaling.ts
export const connectSignaling = (id: string) => {
  const ws = new WebSocket(`https://wonderful-maamoul-186a4d.netlify.app/ws/roomId=${id}`);
  return ws;
};

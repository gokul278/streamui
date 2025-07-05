import { useEffect, useState } from "react";

export const useMedia = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(setStream)
      .catch(console.error);

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return stream;
};

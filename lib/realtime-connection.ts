type Options = {
  url: string;
  onMessage: (event: MessageEvent) => void;
  onOpen: () => void;
  createSocket?: (url: string) => WebSocket;
};

export function connectRealtime({ url, onMessage, onOpen, createSocket = (address) => new WebSocket(address) }: Options) {
  let stopped = false;
  let socket: WebSocket | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let handshakeTimer: ReturnType<typeof setTimeout> | null = null;
  let failures = 0;

  const releaseSocket = () => {
    if (handshakeTimer) clearTimeout(handshakeTimer);
    handshakeTimer = null;
    if (socket) {
      socket.onopen = socket.onclose = socket.onerror = socket.onmessage = null;
      socket.close();
      socket = null;
    }
  };

  const retry = () => {
    releaseSocket();
    if (stopped || retryTimer) return;
    retryTimer = setTimeout(() => {
      retryTimer = null;
      connect();
    }, Math.min(1000 * 2 ** Math.min(failures++, 5), 30000));
  };

  const connect = () => {
    if (stopped) return;
    try {
      socket = createSocket(url);
      socket.onmessage = onMessage;
      socket.onopen = () => {
        if (handshakeTimer) clearTimeout(handshakeTimer);
        handshakeTimer = null;
        failures = 0;
        onOpen();
      };
      socket.onerror = retry;
      socket.onclose = (event) => {
        if (event.code === 1008 || event.code === 4401 || event.code === 4403) {
          stopped = true;
          releaseSocket();
          return;
        }
        retry();
      };
      handshakeTimer = setTimeout(retry, 10000);
    } catch {
      retry();
    }
  };

  connect();
  return () => {
    stopped = true;
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
    releaseSocket();
  };
}

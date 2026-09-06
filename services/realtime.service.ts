function getRealtimeUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";
  const url = new URL("/realtime", baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}

export { getRealtimeUrl };

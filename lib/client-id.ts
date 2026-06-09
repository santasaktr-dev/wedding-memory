const clientIdKey = "js-wedding-client-id";

export function getWeddingClientId() {
  if (typeof window === "undefined") {
    return "server";
  }

  const existing = window.localStorage.getItem(clientIdKey);
  if (existing) return existing;

  const nextId = crypto.randomUUID();
  window.localStorage.setItem(clientIdKey, nextId);
  return nextId;
}

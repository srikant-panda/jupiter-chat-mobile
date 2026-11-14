export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("jupiter-chat.customApiUrl")?.trim();
    if (custom) return custom.replace(/\/$/, "");
  }
  const configuredApi = import.meta.env.VITE_API_URL?.trim();
  const devHostApi =
    !configuredApi &&
    typeof window !== "undefined" &&
    (window.location.port === "5174" || window.location.port === "5173")
      ? `${window.location.protocol}//${window.location.hostname}:3000/api`
      : "";

  return (
    configuredApi ||
    devHostApi ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? `${window.location.protocol}//${window.location.hostname}:3000/api`
      : "http://10.0.2.2:3000/api")
  ).replace(/\/$/, "");
}

export function setCustomApiUrl(url) {
  if (typeof window !== "undefined") {
    const clean = (url || "").trim().replace(/\/$/, "");
    if (clean) {
      localStorage.setItem("jupiter-chat.customApiUrl", clean);
    } else {
      localStorage.removeItem("jupiter-chat.customApiUrl");
    }
  }
}

const API = getApiBaseUrl();

// On mobile, keep token in localStorage so refreshing / reopening the PWA doesn't log the user out
let accessToken =
  (typeof window !== "undefined" &&
    (localStorage.getItem("jupiter-chat.accessToken") ||
      sessionStorage.getItem("jupiter-chat.accessToken"))) ||
  "";

export const setAccessToken = (t) => {
  accessToken = t || "";
  if (typeof window !== "undefined") {
    if (accessToken) {
      localStorage.setItem("jupiter-chat.accessToken", accessToken);
      sessionStorage.setItem("jupiter-chat.accessToken", accessToken);
    } else {
      localStorage.removeItem("jupiter-chat.accessToken");
      sessionStorage.removeItem("jupiter-chat.accessToken");
    }
  }
};

export const getAccessToken = () => accessToken;

const token = (v) =>
  String(v || "")
    .replace(/^Bearer\s+/i, "")
    .trim();

const uncached = (p) => {
  const base = getApiBaseUrl();
  return `${base}${p}${p.includes("?") ? "&" : "?"}_=${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

async function body(r) {
  const t = await r.text();
  if (!t) return {};
  try {
    return JSON.parse(t);
  } catch {
    return { message: t };
  }
}

async function raw(path, opts = {}) {
  const base = getApiBaseUrl();
  const h = new Headers(opts.headers || {});
  if (opts.body !== undefined && !(opts.body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }
  h.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
  h.set("Pragma", "no-cache");
  if (accessToken) {
    h.set("Authorization", `Bearer ${accessToken}`);
  }

  const method = (opts.method || "GET").toUpperCase();
  const r = await fetch(
    method === "GET" || method === "HEAD" ? uncached(path) : `${base}${path}`,
    {
      ...opts,
      method,
      headers: h,
      credentials: "include",
      cache: "no-store",
    }
  );
  return { response: r, data: await body(r) };
}

let refreshPromise = null;
async function doRefreshAccessToken() {
  try {
    const { response, data } = await raw("/auth/refresh", { method: "POST" });
    const t = token(
      response.headers.get("Authorization") || data?.token || data?.accessToken
    );
    if (t) {
      setAccessToken(t);
      return true;
    }
    if (!response.ok) {
      if (
        response.status === 422 ||
        isAgeRequiredError({ status: response.status, message: data?.message })
      ) {
        const err = new Error(data?.message || "Age is required.");
        err.status = 422;
        throw err;
      }
      setAccessToken("");
      return false;
    }
    setAccessToken("");
    return false;
  } catch (err) {
    if (isAgeRequiredError(err)) {
      throw err;
    }
    setAccessToken("");
    return false;
  }
}

export async function refreshAccessToken() {
  refreshPromise ||= doRefreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function request(path, opts = {}, retry = true) {
  const r = await raw(path, opts);
  if (r.response.status === 401 && retry && !path.startsWith("/auth/refresh")) {
    const ok = await refreshAccessToken();
    if (ok) return request(path, opts, false);
  }
  if (!r.response.ok) {
    const e = new Error(
      r.data?.message ||
        r.data?.errors?.map?.((x) => x.message).join(" ") ||
        `Request failed (${r.response.status})`
    );
    e.status = r.response.status;
    e.payload = r.data;
    throw e;
  }
  return r.data;
}

export async function login(email, password) {
  const { response, data } = await raw("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const e = new Error(data?.message || `Login failed (${response.status})`);
    e.payload = data;
    throw e;
  }
  const t = token(response.headers.get("Authorization"));
  if (!t) {
    throw new Error("Login succeeded but no Authorization token was returned.");
  }
  setAccessToken(t);
  return data;
}

export async function signup(name, email, password, age) {
  const { response, data } = await raw("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, age: Number(age) }),
  });
  if (!response.ok) {
    const e = new Error(data?.message || `Signup failed (${response.status})`);
    e.payload = data;
    throw e;
  }
  const t = token(response.headers.get("Authorization"));
  if (!t) {
    throw new Error("Signup succeeded but no Authorization token was returned.");
  }
  setAccessToken(t);
  return data;
}

export async function logout() {
  try {
    if (accessToken) await request("/auth/logout", { method: "POST" }, false);
  } finally {
    setAccessToken("");
  }
}

export function getGoogleLoginUrl(redirectUrl) {
  const base = getApiBaseUrl();
  const target =
    redirectUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "");
  return `${base}/auth/login/google?redirect_url=${encodeURIComponent(target)}`;
}

export function startGoogleLogin(redirectUrl) {
  if (typeof window !== "undefined") {
    const returnTo = window.location.pathname + window.location.search;
    if (
      returnTo &&
      !returnTo.startsWith("/auth/callback") &&
      !returnTo.startsWith("/oauth/callback")
    ) {
      try {
        localStorage.setItem("jupiter-chat.oauth.returnTo", returnTo);
      } catch {}
    }
    window.location.href = getGoogleLoginUrl(redirectUrl);
  }
}

export async function exchangeOAuthCode(code, provider = "google") {
  const { response, data } = await raw("/auth/mobile/code", {
    method: "POST",
    body: JSON.stringify({ code, provider }),
  });
  if (!response.ok) {
    const e = new Error(
      data?.message || `Code exchange failed (${response.status})`
    );
    e.status = response.status;
    e.payload = data;
    throw e;
  }
  const t =
    token(response.headers.get("Authorization")) ||
    data?.accessToken ||
    data?.access_token ||
    data?.token;
  if (t) {
    setAccessToken(t);
  }
  return data;
}

export async function completeAuth(age) {
  return request("/auth/completeAuth", {
    method: "PUT",
    body: JSON.stringify({ age: Number(age) }),
  });
}

export function isAgeRequiredError(error) {
  if (!error) return false;
  if (error.status === 422) return true;
  const msg = String(error.message || "").toLowerCase();
  return (
    msg.includes("age is required") ||
    msg.includes("set your age") ||
    msg.includes("provide age")
  );
}

export async function getMe() {
  return request("/user/get-me");
}

export async function deleteUserAccount() {
  return request("/user/delete-user");
}

export async function getRecentChats() {
  const d = await request("/chat/getRecentChat");
  return Array.isArray(d?.chats) ? d.chats : [];
}

export async function getMessages(id) {
  const d = await request(`/message/${id}`);
  return Array.isArray(d?.data) ? d.data : [];
}

export async function deleteChat(id) {
  return request(`/chat/${id}`, { method: "DELETE" });
}

export async function streamMessage({
  content,
  chatId,
  model,
  onEvent,
  signal,
}) {
  async function attempt(retry = true) {
    const base = getApiBaseUrl();
    const h = new Headers({
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
      Pragma: "no-cache",
    });
    if (accessToken) h.set("Authorization", `Bearer ${accessToken}`);
    const path = chatId ? `/message/${chatId}/stream` : `/message/stream`;
    const r = await fetch(
      `${base}${path}?_=${Date.now()}-${Math.random().toString(36).slice(2)}`,
      {
        method: "POST",
        headers: h,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ content, model }),
        signal,
      }
    );
    if (r.status === 401 && retry) {
      const ok = await refreshAccessToken();
      if (ok) return attempt(false);
    }
    if (!r.ok) {
      const d = await body(r);
      const e = new Error(d?.message || `Stream failed (${r.status})`);
      e.status = r.status;
      e.payload = d;
      throw e;
    }
    if (!r.body) {
      throw new Error("Streaming is not supported on this browser.");
    }
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const emit = (rawEvent) => {
      const lines = rawEvent.split("\n");
      let event = "message",
        data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trimStart();
      }
      if (!data) return;
      try {
        onEvent(event, JSON.parse(data));
      } catch {
        onEvent(event, { text: data });
      }
    };
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let parts = buffer.split(/\n\n/);
      buffer = parts.pop() || "";
      for (const p of parts) emit(p);
    }
    buffer += decoder.decode();
    if (buffer.trim()) emit(buffer);
  }
  return attempt(true);
}

export async function getModels() {
  const d = await request("/models");
  return d;
}

export { API };

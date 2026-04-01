const base = "";

function friendlyError(res, data) {
  if (res.status === 504 || res.status === 502) {
    return "Server is warming up — please try again in a moment.";
  }
  if (res.status === 503) {
    return "Database unavailable. Please try again.";
  }
  if (typeof data?.error === "string" && data.error) return data.error;
  return res.statusText || "Request failed";
}

export async function apiGet(path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(friendlyError(res, data));
  return data;
}

export async function apiPost(path, body, options = {}) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(friendlyError(res, data));
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiPatch(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(friendlyError(res, data));
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiDelete(path) {
  const res = await fetch(`${base}${path}`, { method: "DELETE", credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(friendlyError(res, data));
  return data;
}

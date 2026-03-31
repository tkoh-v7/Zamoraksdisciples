const API_BASE = "https://damp-mud-ecd0.r-2007scaper.workers.dev";

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmt(ts) {
  return new Date(ts).toLocaleString();
}

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || "Request failed.");
  }

  return data;
}

async function loadClanMessages(targetId = "boardFeed") {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = "<p class='muted'>Loading messages...</p>";

  try {
    const items = await api("/api/clan/messages");
    if (!items.length) {
      target.innerHTML = "<p class='muted'>No messages yet.</p>";
      return;
    }

    target.innerHTML = items.map(item => `
      <div class="message">
        <div class="top">
          <span>${escapeHtml(item.name)}</span>
          <span class="small muted">${fmt(item.ts)}</span>
        </div>
        <div>${escapeHtml(item.message)}</div>
      </div>
    `).join("");
  } catch (err) {
    target.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

async function loadClanMembers(targetId = "membersList") {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = "<p class='muted'>Loading members...</p>";

  try {
    const items = await api("/api/clan/members");
    if (!items.length) {
      target.innerHTML = "<p class='muted'>No members added yet.</p>";
      return;
    }

    target.innerHTML = items.map(item => `
      <div class="member">
        <div><strong>${escapeHtml(item.name || "")}</strong></div>
        <div class="muted">${escapeHtml(item.role || "Member")}</div>
      </div>
    `).join("");
  } catch (err) {
    target.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
  }
}

async function submitClanMessage() {
  const name = document.getElementById("boardName");
  const message = document.getElementById("boardMessage");
  const website = document.getElementById("boardWebsite");
  const status = document.getElementById("boardStatus");
  const btn = document.getElementById("postBtn");

  status.innerHTML = "";
  btn.disabled = true;

  try {
    await api("/api/clan/message", {
      method: "POST",
      body: JSON.stringify({
        name: name.value,
        message: message.value,
        website: website.value
      })
    });

    name.value = "";
    message.value = "";
    status.innerHTML = `<div class="success">Message posted.</div>`;
    await loadClanMessages();
  } catch (err) {
    status.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
}

async function submitClanApplication() {
  const rsn = document.getElementById("applyRsn");
  const combat = document.getElementById("applyCombat");
  const discord = document.getElementById("applyDiscord");
  const reason = document.getElementById("applyReason");
  const website = document.getElementById("applyWebsite");
  const status = document.getElementById("applyStatus");
  const btn = document.getElementById("applyBtn");

  status.innerHTML = "";
  btn.disabled = true;

  try {
    await api("/api/clan/apply", {
      method: "POST",
      body: JSON.stringify({
        rsn: rsn.value,
        combat: combat.value,
        discord: discord.value,
        reason: reason.value,
        website: website.value
      })
    });

    rsn.value = "";
    combat.value = "";
    discord.value = "";
    reason.value = "";
    status.innerHTML = `<div class="success">Application sent.</div>`;
  } catch (err) {
    status.innerHTML = `<div class="error">${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
}

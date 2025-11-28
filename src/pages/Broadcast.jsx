import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Send as SendIcon, AtSign, Hash } from "lucide-react";

const API = "https://backend-femboyhelper-production.up.railway.app/broadcast";

export default function Broadcast() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const groupedChannels = useMemo(() => {
    const groups = {};
    channels.forEach((ch) => {
      if (!groups[ch.guildId]) groups[ch.guildId] = { guildName: ch.guildName, items: [] };
      groups[ch.guildId].items.push(ch);
    });
    return groups;
  }, [channels]);

  const loadChannels = async () => {
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const res = await fetch(`${API}/channels`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to load channels");
      setChannels(json.channels || []);
      setStatus("Channels synced from bot.");
    } catch (err) {
      setError(err.message || "Failed to load channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const appendToken = (token) => {
    setMessage((prev) => (prev ? `${prev} ${token}` : token));
  };

  const sendBroadcast = async () => {
    if (!selectedChannel) {
      setError("Choose a channel first.");
      return;
    }
    if (!message.trim()) {
      setError("Type a message first.");
      return;
    }

    setError("");
    setStatus("");
    setSending(true);
    try {
      const res = await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: selectedChannel, message }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Broadcast failed");
      setStatus("Broadcast sent.");
    } catch (err) {
      setError(err.message || "Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass p-6 space-y-5 fade-slide">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Broadcast</h1>
          <p className="text-sm text-white/60">
            Send announcements to any text channel. Mentions like <code>@everyone</code>,{" "}
            <code>&lt;@userId&gt;</code>, and <code>&lt;@&amp;roleId&gt;</code> are supported.
          </p>
        </div>
        <button
          onClick={loadChannels}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-50"
        >
          <RefreshCw size={16} /> {loading ? "Syncing..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-sm text-white/70">Channel</label>
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="bg-black/40 w-full p-3 rounded border border-white/10"
        >
          <option value="">Select a text channel</option>
          {Object.entries(groupedChannels).map(([guildId, group]) => (
            <optgroup key={guildId} label={group.guildName}>
              {group.items.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  #{ch.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/70">Message</label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-black/40 rounded p-3 border border-white/10"
          placeholder="Hello @everyone, important update..."
        />
        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          <button
            onClick={() => appendToken("@everyone")}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1"
          >
            <AtSign size={14} /> everyone
          </button>
          <div className="flex items-center gap-1">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
              className="bg-black/30 p-2 rounded border border-white/10 w-32"
            />
            <button
              onClick={() => {
                if (!userId.trim()) return;
                appendToken(`<@${userId.trim()}>`);
                setUserId("");
              }}
              className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <AtSign size={14} /> user
            </button>
          </div>
          <div className="flex items-center gap-1">
            <input
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              placeholder="Role ID"
              className="bg-black/30 p-2 rounded border border-white/10 w-32"
            />
            <button
              onClick={() => {
                if (!roleId.trim()) return;
                appendToken(`<@&${roleId.trim()}>`);
                setRoleId("");
              }}
              className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Hash size={14} /> role
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={sendBroadcast}
          disabled={sending}
          className="flex items-center gap-2 bg-pink-500 px-5 py-2 rounded shadow hover:bg-pink-600 transition disabled:opacity-50"
        >
          <SendIcon size={16} />
          {sending ? "Sending..." : "Send Broadcast"}
        </button>
        {status && <span className="text-green-400 text-sm">{status}</span>}
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>
    </div>
  );
}

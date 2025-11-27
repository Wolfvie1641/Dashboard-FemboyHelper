import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, Heart, Play } from "lucide-react";
import { io } from "socket.io-client";

const API = "http://localhost:3001/wedding";
const socket = io("http://localhost:3001", { transports: ["websocket"] });
socket.emit("identify", "dashboard");

export default function WeddingDashboard({ guildId }) {
  const [guilds, setGuilds] = useState([]);
  const [guild, setGuild] = useState(guildId || "");
  const [settings, setSettings] = useState(null);
  const [marriages, setMarriages] = useState([]);
  const [members, setMembers] = useState([]);
  const [partner1, setPartner1] = useState("");
  const [partner2, setPartner2] = useState("");
  const [liveLogs, setLiveLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const selectedGuildName = useMemo(
    () => guilds.find((g) => g.id === guild)?.name || "",
    [guilds, guild]
  );

  const loadGuilds = async () => {
    setError("");
    try {
      const res = await fetch(`${API}/guilds`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to load guilds");
      setGuilds(json.guilds || []);
      if (!guild && json.guilds?.[0]) {
        const first = json.guilds[0].id;
        setGuild(first);
        loadData(first);
        loadMembers(first);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load guilds.");
    }
  };

  const loadMembers = async (guildIdTarget) => {
    if (!guildIdTarget) return;
    try {
      const res = await fetch(`${API}/members/${guildIdTarget}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to load members");
      setMembers(json.members || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load members.");
    }
  };

  const loadData = async (id) => {
    const target = id || guild;
    if (!target) {
      setError("Choose a server first.");
      return;
    }
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const [sRes, mRes] = await Promise.all([
        fetch(`${API}/settings/${target}`),
        fetch(`${API}/list/${target}`),
      ]);
      const sJson = await sRes.json();
      const mJson = await mRes.json();
      setSettings(sJson);
      setMarriages(mJson || []);
      setStatus("Loaded wedding settings and marriages.");
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!guild) {
      setError("Choose a server first.");
      return;
    }
    setError("");
    setStatus("");
    try {
      await fetch(`${API}/settings/${guild}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setStatus("Settings saved.");
    } catch (err) {
      console.error(err);
      setError("Failed to save settings.");
    }
  };

  const startWedding = async () => {
    if (!guild || !partner1 || !partner2 || !settings?.weddingChannel) {
      setError("Select server, both partners, and wedding channel.");
      return;
    }
    setError("");
    setStatus("");
    setSending(true);
    try {
      const res = await fetch(`${API}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: guild,
          partner1Id: partner1,
          partner2Id: partner2,
          channelId: settings.weddingChannel,
          roleId: settings.weddingRole || undefined,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Failed to start wedding");
      setStatus("Wedding start requested.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to start wedding.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadGuilds();
    socket.on("dashboard:log", (d) => {
      setLiveLogs((prev) => [d, ...prev].slice(0, 100));
    });
    return () => {
      socket.off("dashboard:log");
    };
  }, []);

  useEffect(() => {
    if (guildId) {
      setGuild(guildId);
      loadData(guildId);
      loadMembers(guildId);
    }
  }, [guildId]);

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `${m.username} (${m.tag})`,
  }));

  return (
    <div className="glass p-6 space-y-5 fade-slide">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="text-pink-400" /> Wedding Control
          </h1>
          <p className="text-sm text-white/60">
            Configure wedding channel/role, view married pairs, and start ceremonies.
          </p>
        </div>
        <button
          onClick={() => loadData()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-50"
        >
          <RefreshCw size={16} /> {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="bg-black/40 w-64 p-2 rounded border border-white/10"
          value={guild}
          onChange={(e) => {
            const id = e.target.value;
            setGuild(id);
            loadData(id);
            loadMembers(id);
          }}
        >
          <option value="">Choose server</option>
          {guilds.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        {status && <span className="text-green-400 text-sm">{status}</span>}
        {error && <span className="text-red-400 text-sm">{error}</span>}
      </div>

      {!settings ? (
        <div className="text-white/60">Choose a server and press Refresh.</div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-3 glass p-4 rounded-lg border border-white/10">
              <p className="text-sm text-white/70">Allowed Wedding Channel (ID)</p>
              <input
                className="bg-black/40 w-full p-2 rounded border border-white/10"
                placeholder="Channel ID"
                value={settings.weddingChannel || ""}
                onChange={(e) =>
                  setSettings({ ...settings, weddingChannel: e.target.value })
                }
              />
              <p className="text-sm text-white/70">Wedding Role (ID)</p>
              <input
                className="bg-black/40 w-full p-2 rounded border border-white/10"
                placeholder="Role ID"
                value={settings.weddingRole || ""}
                onChange={(e) =>
                  setSettings({ ...settings, weddingRole: e.target.value })
                }
              />
              <p className="text-sm text-white/70">Ceremony Language</p>
              <select
                className="bg-black/40 w-full p-2 rounded border border-white/10"
                value={settings.language || "en"}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
              >
                <option value="en">English</option>
                <option value="id">Indonesia</option>
              </select>
              <button
                onClick={saveSettings}
                className="flex items-center gap-2 bg-pink-500 px-4 py-2 rounded shadow hover:bg-pink-600 transition"
              >
                <Save size={16} /> Save Settings
              </button>
              <p className="text-xs text-white/50">
                Wedding Live logs are limited to the allowed channel.
              </p>
            </div>

            <div className="space-y-3 glass p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Start Wedding</h3>
                <span className="text-xs text-white/50">{selectedGuildName}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-white/70">Partner 1</p>
                <select
                  className="bg-black/40 w-full p-2 rounded border border-white/10"
                  value={partner1}
                  onChange={(e) => setPartner1(e.target.value)}
                >
                  <option value="">Select partner 1</option>
                  {memberOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-white/70">Partner 2</p>
                <select
                  className="bg-black/40 w-full p-2 rounded border border-white/10"
                  value={partner2}
                  onChange={(e) => setPartner2(e.target.value)}
                >
                  <option value="">Select partner 2</option>
                  {memberOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={startWedding}
                disabled={sending}
                className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded shadow hover:bg-blue-600 transition disabled:opacity-50"
              >
                <Play size={16} /> {sending ? "Starting..." : "Start Wedding"}
              </button>
              <p className="text-xs text-white/50">
                This triggers the bot to announce in the allowed channel and apply the wedding role.
              </p>
            </div>

            <div className="glass p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Married Couples</h3>
                <span className="text-sm text-white/50">
                  {marriages.length} pairs
                </span>
              </div>
              {marriages.length === 0 ? (
                <p className="text-white/60 text-sm">No couples yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {marriages.map(([a, b], idx) => (
                    <div
                      key={`${a}-${b}-${idx}`}
                      className="glass p-3 rounded border border-white/5 flex justify-between text-sm"
                    >
                      <span>&lt;@{a}&gt;</span>
                      <span className="text-white/50">❤</span>
                      <span>&lt;@{b}&gt;</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass p-4 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-3">Wedding Live</h3>
            {liveLogs.length === 0 ? (
              <p className="text-white/60 text-sm">No wedding logs yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {liveLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="glass p-3 rounded border border-white/5"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-pink-300 font-semibold">
                        {log.authorTag}
                      </span>
                      <span className="text-white/50">
                        {log.guildName} • #{log.channelName}
                      </span>
                    </div>
                    <p className="text-white mt-1 text-sm">{log.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

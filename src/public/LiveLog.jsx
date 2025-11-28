import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://backend-femboyhelper-production.up.railway.app", { transports: ["websocket"] });
socket.emit("identify", "dashboard");

export default function LiveLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on("dashboard:log", (d) =>
      setLogs((prev) => [d, ...prev].slice(0, 150))
    );
    return () => socket.off("dashboard:log");
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-4xl font-bold mb-4 text-purple-400">Marriage Live Logs</h2>

      <div className="glass p-4">
        {logs.length === 0 ? (
          <p className="text-gray-400">Waiting for messages...</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log, index) => (
              <li
                key={index}
                className="glass p-3 rounded-lg glow transition"
              >
                <div className="flex justify-between">
                  <span className="font-bold text-purple-300">
                    {log.authorTag}
                  </span>
                  <span className="text-gray-400 text-sm">{log.guildName}</span>
                </div>

                <p className="mt-1 text-gray-200">{log.content}</p>

                <p className="mt-1 text-xs text-gray-500">
                  #{log.channelName}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

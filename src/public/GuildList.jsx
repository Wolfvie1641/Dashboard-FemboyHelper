export default function GuildList({ guilds }) {
  return (
    <div className="space-y-3">
      {guilds.map((g) => (
        <div key={g.id} className="glass flex items-center p-3 gap-3 glow">
          <img
            src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64`}
            className="w-12 h-12 rounded-full"
          />
          <span>{g.name}</span>
        </div>
      ))}
    </div>
  );
}

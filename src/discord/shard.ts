import { ShardingManager } from "discord.js";
import setting from "../../settings.json";

export default function DiscordBoot() {
    const shardGenerator = new ShardingManager(
        `./cash/src/discord/bot/main.js`,
        {
            totalShards: "auto",
            shardList: "auto",
            mode: "worker",
            respawn: true,
            token: setting.token,
        }
    );

    shardGenerator.on("shardCreate", async (shard) => {
        console.log(`[SHARD ${shard.id}]: Shard successful create!`);

        shard.on("death", () =>
            console.warn(`[SHARD ${shard.id}]: Shard death!`)
        );

        shard.on("disconnect", () =>
            console.warn(`[SHARD ${shard.id}]: Shard disconnected!`)
        );

        shard.on("error", (err: any) =>
            console.error(`[SHARD ${shard.id}]: Shard error: `, err)
        );

        shard.on("ready", () =>
            console.log(`[SHARD ${shard.id}]: Shard ready!`)
        );

        shard.on("reconnecting", () =>
            console.warn(`[SHARD ${shard.id}]: Shard reconnecting...`)
        );

        shard.on("spawn", () =>
            console.log(`[SHARD ${shard.id}]: Shard spawned!`)
        );

        shard.on("message", (msg: any) =>
            console.log(`[SHARD ${shard.id}]: `, msg)
        );
    });

    // Take from "github.com/Satont/channelsbot".
    const BotStatusUpdate = async () => {
        const [guilds, members] = await Promise.all([
            shardGenerator.fetchClientValues("guilds.cache.size"),
            shardGenerator.broadcastEval(
                "this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)"
            ),
        ]);

        const totalGuilds = guilds.reduce(
            (acc, guildCount) => acc + guildCount,
            0
        );

        const totalMembers = members.reduce(
            (acc, memberCount) => acc + memberCount,
            0
        );

        shardGenerator.broadcastEval(
            `this.user.setPresence({ activity: { type: "WATCHING", name: '${totalMembers} users and ${totalGuilds} guilds!' }, status: "DND" })`
        );
    };

    setInterval(() => BotStatusUpdate(), 60 * 1000);

    shardGenerator
        .spawn("auto")
        .then(() => {
            BotStatusUpdate();
            console.log(`[SHARD SPAWNER]: Shard spawned!`);
        })
        .catch((err) => console.error(`[SHARD ERROR]: `, err));
}

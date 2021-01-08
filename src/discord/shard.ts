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

        shard.on("error", (err) =>
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

        shard.on("message", (msg) =>
            console.log(`[SHARD ${shard.id}]: ${msg}`)
        );
    });

    shardGenerator
        .spawn("auto")
        .then(() => console.log(`[SHARD SPAWNER]: Shard spawned!`))
        .catch((err) => console.error(`[SHARD ERROR]:`, err));
}

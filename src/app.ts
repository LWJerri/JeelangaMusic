import "source-map-support";
import DiscordBoot from "./discord/shard";
import { translate } from "./misc/lang";

translate;
DiscordBoot();

process.on("uncaughtException", (err: any) => console.error(err));
process.on("unhandledRejection", (err: any) => console.error(err));

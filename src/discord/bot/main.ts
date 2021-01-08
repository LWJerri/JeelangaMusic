import { Client } from "discord.js";
import setting from "../../../settings.json";

export const bot = new Client({
    disableMentions: "none",
    partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
});

bot.login(setting.token);

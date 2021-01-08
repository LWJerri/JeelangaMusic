import { readFileSync } from "fs";
import { get, template } from "lodash";
import { lang } from "../../settings.json";

export const translate = (path: any, data: any) => {
    const langs = {
        ru: JSON.parse(readFileSync(`./localization/${lang}.json`, "utf-8")),
    };

    const paths = get(langs, `lang.${path}`);
    const result = template(paths, { interpolate: /{{([\s\S]+?)}}/g });

    return result(data);
};

console.log(`[LOCALIZATION]: Language system loaded!`);

import toFormat from "./action/toFormat";
import toV45 from "./action/toV45";
import toNew from "./action/toNew";
//import toBinary from "./action/toBinary";
//import toWeb from "./action/toWeb";
import toSpine from "./action/toSpine";
import format from "./action/formatFormat";
import * as dbft from "./format/dragonBonesFormat";
import * as spft from "./format/spineFormat";

type Input = {
    from: "spine" | "cocos";
    to: "binary" | "new" | "v45" | "player" | "viewer" | "spine";
    data: string; // DragonBones JSON string | spine JSON string { data: string, textureAtlas: string }
    compress?: boolean;
    forPro?: boolean;
    textureAtlases?: string[]; // PNG Base64 string.
    config?: any; // { web: web config, spine: spine verison }
};

type FormatType = "string" | "base64" | "binary";

class Output {
    public format: FormatType;
    public name: string;
    public suffix: string;
    public data: any;

    public constructor(data: any, name: string = "", suffix: string = "", format: FormatType = "string") {
        this.data = data;
        this.format = format;
        this.name = name;
        this.suffix = suffix;
    }
}

function compress(data: any, config: any[]): boolean {
    if ((typeof data) !== "object") {
        return false;
    }

    if (data instanceof Array) {
        const array = data as any[];
        for (const item of array) {
            compress(item, config);
        }

        if (array.length === 0) {
            return true;
        }
    }
    else {
        let defaultData: any = null;
        for (defaultData of config) {
            if (data.constructor === defaultData.constructor) {
                break;
            }

            defaultData = null;
        }

        if (defaultData !== null || typeof data === "object") {
            let count = 0;
            for (let k in data) {
                if (k.charAt(0) === "_") { // Pass private value.
                    delete data[k];
                    continue;
                }

                const value = data[k];
                const valueType = typeof value;

                if (defaultData !== null && (value === null || valueType === "undefined" || valueType === "boolean" || valueType === "number" || valueType === "string")) {
                    const defaultValue = defaultData[k];
                    if (value === defaultValue || (valueType === "number" && isNaN(value) && isNaN(defaultValue))) {
                        delete data[k];
                        continue;
                    }
                }
                else if (valueType === "object") {
                    if (compress(value, config)) {
                        delete data[k];
                        continue;
                    }
                }
                else {
                    continue;
                }

                count++;
            }

            return count === 0;
        }
    }

    return false;
}

export function db2(input: Input): Output[] {
    let dragonBonesData: dbft.DragonBones | null = null;
    try {
        dragonBonesData = toFormat(
            input.data,
            () => {
                return [];
            }
        );
    }
    catch (error) {
    }

    if (!dragonBonesData) {
        throw new Error("Code.DataError");
    }

    const toOutput: Output[] = [];

    switch (input.to) {
        case "binary": {
            throw new Error("input.to:binary not yet implemented");
            /*
            toNew(dragonBonesData, true);
            format(dragonBonesData);
            const result = new Buffer(toBinary(dragonBonesData)).toString("base64");

            toOutput.push(
                new Output(
                    result,
                    dragonBonesData.name,
                    "_ske.dbbin",
                    "base64"
                )
            );
            break;
            */
        }

        case "new": {
            toNew(dragonBonesData, false);
            format(dragonBonesData);

            if (input.compress !== false) {
                compress(dragonBonesData, dbft.compressConfig);
            }

            const result = JSON.stringify(dragonBonesData);
            toOutput.push(
                new Output(
                    result,
                    dragonBonesData.name,
                    "_ske.json",
                    "string"
                )
            );
            break;
        }

        case "v45": {
            toV45(dragonBonesData);
            format(dragonBonesData);

            if (input.compress !== false) {
                compress(dragonBonesData, dbft.compressConfig);
            }

            const result = JSON.stringify(dragonBonesData);
            toOutput.push(
                new Output(
                    result,
                    dragonBonesData.name,
                    "_ske.json",
                    "string"
                )
            );
            break;
        }

        case "player":
        case "viewer": {
            throw new Error("input.to:[player|viewer] not yet implemented");
            /*
            toNew(dragonBonesData, true);
            const result = toWeb(
                {
                    data: new Buffer(toBinary(dragonBonesData)),
                    textureAtlases: input.textureAtlases ? input.textureAtlases.map((v) => {
                        return new Buffer(v, "base64");
                    }) : [],
                    config: input.config
                },
                input.to === "player"
            );
            toOutput.push(
                new Output(
                    result,
                    dragonBonesData.name,
                    ".html",
                    "string"
                )
            );
            break;
            */
        }

        case "spine": {
            toNew(dragonBonesData, true);
            format(dragonBonesData);
            const result = toSpine(dragonBonesData, input.config);

            for (const spine of result.spines) {
                if (input.compress !== false) {
                    compress(spine, spft.compressConfig);
                }

                toOutput.push(
                    new Output(
                        JSON.stringify(spine),
                        result.spines.length > 1 ? `${dragonBonesData.name}_${spine.skeleton.name}` : dragonBonesData.name,
                        ".json",
                        "string"
                    )
                );
            }

            if (result.textureAtlas) {
                toOutput.push(
                    new Output(
                        result.textureAtlas,
                        dragonBonesData.name,
                        ".atlas",
                        "string"
                    )
                );
            }
            break;
        }

        default:
            throw new Error("Code.DataError");
    }

    return toOutput;
}

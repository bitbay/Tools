import * as dbft from "./format/dragonBonesFormat";
import toFormat from "./action/toFormat";
import toV45 from "./action/toV45";
import toNew from "./action/toNew";
import { copyFromObject } from "./common/safeutils";
import format from "./action/formatFormat";

type Input = {
    from: "spine" | "cocos";
    to: "binary" | "new" | "v45" | "player" | "viewer" | "spine";
    data: string | any; // DragonBones JSON string | spine JSON string { data: string, textureAtlas: string }
    compress?: boolean;
    forPro?: boolean;
    textureAtlases?: string[]; // PNG Base64 string.
    config?: any; // { web: web config, spine: spine verison }
};

type db2Input = Input & {
    atlasData: any; // DragonBones Atlas JSON
    atlasImage: string; // PNG Base64 string.
}

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

export function db2(input: db2Input): Output[] {
    let dragonBonesData: dbft.DragonBones | null = null;
    let textureAtlasFiles: string[] | null = null;
    let textureAtlasImages: string[] | null = null;
    let textureAtlases: dbft.TextureAtlas[] = new Array<dbft.TextureAtlas>();

    try {
        dragonBonesData = toFormat(
            input.data,
            () => {
                const textureAtlas = new dbft.TextureAtlas();
                copyFromObject(textureAtlas, input.atlasData, dbft.copyConfig);
                textureAtlases.push(textureAtlas);

                return textureAtlases;
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
        case "spine":
        case "viewer": {
            throw new Error("input.to:[player|spine|viewer] not yet implemented");
        }

        default:
            throw new Error("Code.DataError");
    }

    return toOutput;
}

import type { ParamDef } from "@vic0627/karman";

export default function <P extends string, T>(name: P, def: ParamDef, type: T) {
    return { [name]: def } as Record<P, T>;
}

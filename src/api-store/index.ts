import { defineKarman, defineAPI } from "@vic0627/karman";
import productSchema from "./schema/product-schema";
import limitAndSortSchema from "./schema/limit-and-sort-schema";
import { concatAll, map, of } from "rxjs";
import definePayloadDef from "./utils/define-payload-def";

export default defineKarman({
    root: true,
    headerMap: true,
    validation: true,
    url: "https://fakestoreapi.com",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
    api: {
        getProductImages: defineAPI({
            url: "products",
            payloadDef: limitAndSortSchema
                .mutate()
                .setPosition("query")
                .setDefault("limit", () => 10)
                .setOptional().def,
            dto: null as unknown as (typeof productSchema.def)[],
            onSuccess(res) {
                return of(...res.data).pipe(
                    map((value) => fetch(value.image)),
                    concatAll(),
                    map((image) => image.blob()),
                    concatAll()
                );
            },
        }),
        utilTest: defineAPI({
            payloadDef: definePayloadDef(
                "id",
                {
                    position: "path",
                    required: true,
                    rules: ["int", { min: 1 }],
                },
                0
            ),
        }),
    },
});

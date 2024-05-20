import { defineKarman, defineAPI, getType } from "@vic0627/karman";
import productSchema from "./schema/product-schema";
import limitAndSortSchema from "./schema/limit-and-sort-schema";
import { concatAll, map, of, from } from "rxjs";

export default defineKarman({
    root: true,
    headerMap: true,
    validation: true,
    url: "https://fakestoreapi.com",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
    api: {
        getProducts: defineAPI({
            url: "products",
            payloadDef: limitAndSortSchema
                .mutate()
                .setPosition("query")
                .setDefault("limit", () => 10)
                .setOptional().def,
            dto: getType([productSchema.def]),
        }),
        utilTest: defineAPI({
            payloadDef: {
                id: {
                    position: "path",
                    required: true,
                    rules: ["int", { min: 1 }],
                    type: 1,
                },
            },
        }),
    },
});

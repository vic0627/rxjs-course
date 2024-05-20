import {
    defineSchemaType,
    defineCustomValidator,
    ValidationError,
} from "@vic0627/karman";

const required = true;

export type Category =
    | "electronics"
    | "jewelery"
    | "men's clothing"
    | "women's clothing";

export default defineSchemaType("Product", {
    /**
     * product name
     * @min 1
     * @max 20
     */
    title: {
        required,
        rules: ["string", { min: 1, max: 20, measurement: "length" }],
        type: "",
    },
    /**
     * pricing
     * @min 1
     */
    price: {
        required,
        rules: ["number", { min: 1 }],
        type: 1,
    },
    /**
     * description of product
     * @min 1
     * @max 100
     */
    description: {
        required,
        rules: ["string", { min: 1, max: 100, measurement: "length" }],
        type: "",
    },
    /**
     * product image
     */
    image: {
        required,
        rules: "string",
        type: "",
    },
    category: {
        required: true,
        rules: [
            "string",
            defineCustomValidator((_, value) => {
                if (
                    ![
                        "electronics",
                        "jewelery",
                        "men's clothing",
                        "women's clothing",
                    ].includes(value as string)
                )
                    throw new ValidationError("invalid category");
            }),
        ],
        type: "" as Category,
    },
});

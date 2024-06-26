import {
    defineSchemaType,
    defineCustomValidator,
    ValidationError,
} from "@vic0627/karman";

const required = true;

export type Sort = "asc" | "desc";

export default defineSchemaType("LimitAndSort", {
    /**
     * number of return transactions
     */
    limit: { required, rules: ["int", { min: 1 }], type: 1 },
    /**
     * sorting strategy
     */
    sort: {
        required,
        rules: [
            "string",
            defineCustomValidator((prop, value) => {
                if (!["asc", "desc"].includes(value as string))
                    throw new ValidationError(
                        `parameter "${prop}" must be "asc" or "desc"`
                    );
            }),
        ],
        type: "" as Sort,
    },
});

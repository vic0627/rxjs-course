import { of, map, concatAll } from "rxjs";

type ID = { id: number };

export default of("products", "users", "carts").pipe(
    map((fragment) => `https://fakestoreapi.com/${fragment}`),
    map((url) => fetch(url)),
    concatAll(),
    map((data) => data.json()),
    concatAll(),
    map((arr: ID[]) => arr?.map((value) => value?.id))
);

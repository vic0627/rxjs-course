// import { mapObs } from "@/new-observable";
// import fakeStoreData from "@/fake-store-data";
import apiStore from "@/api-store";
import { Sort } from "@/api-store/schema/limit-and-sort-schema";
import { from, map, Observable, Subject, Subscriber } from "rxjs";

const app = document.getElementById("app") as HTMLElement;

// class ImageDOM {
//     $el: HTMLElement;
//     constructor(src: string, alt?: string) {
//         this.$el = document.createElement("img");
//         this.$el.setAttribute("src", src);
//         alt && this.$el.setAttribute("alt", alt);
//         this.setStyle();
//     }
//     appendTo(dom: HTMLElement) {
//         dom.appendChild(this.$el);
//     }
//     setStyle() {
//         this.$el.style.width = "100px";
//     }
// }

// mapObs.subscribe({
//     next: (value) => console.log(`Received value from Observable => ${value}`),
//     complete: () => console.log("Observable is completed"),
// });

// fakeStoreData.subscribe((data) => console.log(data));

// const [res] = apiStore.getProductImages({
//     sort: "desc",
// });

// res.then((data) => {
//     app.innerHTML = "";

//     data?.subscribe((value) => {
//         const objURL = URL.createObjectURL(value);
//         new ImageDOM(objURL).appendTo(app);
//     });
// });

const test = (option?: { limit?: number; sort?: Sort }) => {
    const { limit, sort } = option ?? {};
    const obs = new Observable((subscriber) => {
        const [, abort] = apiStore.getProducts(
            { limit, sort },
            {
                onSuccess(res) {
                    subscriber.next(res);
                },
                onError(err) {
                    subscriber.error(err);
                    return 1;
                },
                onFinally() {
                    subscriber.complete();
                },
            }
        );

        return abort;
    });

    return obs;
};

const sbp = test().subscribe({
    next(val) {
        console.log("received value:", val);
    },
    error(err) {
        console.error(err);
    },
    complete() {
        console.log("request ended");
    },
});

sbp.unsubscribe();

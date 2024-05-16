// import { mapObs } from "@/new-observable";
// import fakeStoreData from "@/fake-store-data";
import apiStore from "@/api-store";
import { map } from "rxjs";

const app = document.getElementById("app") as HTMLElement;

class ImageDOM {
    $el: HTMLElement;
    constructor(src: string, alt?: string) {
        this.$el = document.createElement("img");
        this.$el.setAttribute("src", src);
        alt && this.$el.setAttribute("alt", alt);
        this.setStyle();
    }
    appendTo(dom: HTMLElement) {
        dom.appendChild(this.$el);
    }
    setStyle() {
        this.$el.style.width = "100px";
    }
}

// mapObs.subscribe({
//     next: (value) => console.log(`Received value from Observable => ${value}`),
//     complete: () => console.log("Observable is completed"),
// });

// fakeStoreData.subscribe((data) => console.log(data));

const [res] = apiStore.getProductImages({
    sort: "desc",
});

res.then((data) => {
    app.innerHTML = "";

    data?.subscribe((value) => {
        const objURL = URL.createObjectURL(value);
        new ImageDOM(objURL).appendTo(app);
    });
});

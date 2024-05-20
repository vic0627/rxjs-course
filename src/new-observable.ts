import { Observable, map } from "rxjs";

const obs = new Observable<number>((subscriber) => {
    let t: number | NodeJS.Timeout;
    try {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);

        t = setTimeout(() => {
            subscriber.next(4);
            subscriber.complete();
        }, 2000);

        return () => {
            clearTimeout(t);
            console.log("Cleaning function called");
        };
    } catch (error) {
        subscriber.error(error);
    }
});

export const mapObs = obs.pipe(map((value, index) => value ** index));

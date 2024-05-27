# 用彈珠圖測試 RxJS 的程式碼

<!-- > [!NOTE] -->

我們可以以同步的方式測試非同步的 RxJS 程式碼，需要透過使用 TestScheduler 虛擬化時間來進行，彈珠圖將提供一種視覺化的方法，讓我們可以演示 Observable 的行為，並透過它們來斷定一個特定的 Observable 是否有依照我們預期的行為運作，以及創建我們可以用作模擬的[熱和冷的 Observables](https://benlesh.medium.com/hot-vs-cold-observables-f8094ed53339)。

此時，TestScheduler 只能用來測試使用 RxJS schedulers（像是 `AsyncScheduler` 等等）的程式碼，舉例來說，若是若是程式碼使用了 `Promise`，那麼它就不能透過 `TestScheduler` 獲得可靠的測試結果，反而需要利用更傳統的方法進行測試。

```ts
import { TestScheduler } from "rxjs/testing";
import { throttleTime } from "rxjs";

const testScheduler = new TestScheduler((actual, expected) => {
    // 斷言兩物件相等
    // TestScheduler 需要透過你的測試框架來讓斷言運作
    // 這邊用 chai 作為範例
    expect(actual).deep.equal(expected);
});

// 這邊的測試會同步地運行
it("generates the stream correctly", () => {
    testScheduler.run((helpers) => {
        const { cold, time, expectObservable, expectSubscriptions } = helpers;
        const e1 = cold(" -a--b--c---|");
        const e1subs = "  ^----------!";
        const t = time("   ---|       "); // t = 3
        const expected = "-a-----c---|";

        expectObservable(e1.pipe(throttleTime(t))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1Subs);
    });
});
```

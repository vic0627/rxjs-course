# Scheduler

- [Scheduler](#scheduler)
  - [Scheduler 種類](#scheduler-種類)
  - [使用 Scheduler](#使用-scheduler)


Schedule 會控制訂閱開始的時間還有通知傳送的時間，它由三個部分組成：

-   **Scheduler 是一種資料結構。** 它知道如何根據優先順序或其他標準儲存和排列任務。
-   **Scheduler 是一種執行的上下文。** 它示意了任務要在何時何地被執行（像是立即執行，或是其他回呼機制 `setTimeout`、`process.nextTick`、或 animation frame 等等）。
-   **Scheduler 有一個（虛擬）的時鐘。** 它透過 Scheduler 上的 getter `now()` 來提供關於「時間」的概念。任務在被特定排程調度時僅會遵守這時鐘表示的時間。

下方範例中，我們用一個點單的 Observable 來同步發送 `1`、`2`、`3`，並用 `observeOn` 運算子指定 `asyncScheduler` 來發送這些值：

```js
import { Observable, observeOn, asyncScheduler } from "rxjs";

const observable = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
}).pipe(observeOn(asyncScheduler));

console.log("just before subscribe");
observable.subscribe({
    next(v) {
        console.log(`got value ${v}`);
    },
    error(err) {
        console.error(`something wrong occurred: ${err}`);
    },
    complete() {
        console.log("done");
    },
});
console.log("just after subscribe");

// 輸出
// just before subscribe
// just after subscribe
// got value 1
// got value 2
// got value 3
// done
```

注意到 Next 通知會在 `just after subscribe` 之後才被發送，這與先前看到的 Observable 預設行為不同，因為 `observeOn(asyncScheduler)` 在 `new Observable` 與最終的 Observer 之間引入了 Observer 的代理（`proxyObserver`）。

`proxyObserver` 會在 `observeOn(asyncScheduler)` 內被建立，它的 `next(val)` 函式與下方範例近似：

```js
const proxyObserver = {
    next(val) {
        asyncScheduler.schedule(
            (x) => finalObserver.next(x),
            0 /** 延遲 */,
            val /** 會是上方函式的 `x` 參數 */
        );
    },
    // ...
};
```

`asyncScheduler` 會用 `setTimeout` 或 `setInterval` 進行操作，就算它的延遲是 0 也一樣，通常來說，在 JS 使用 `setTimeout(fn, 0)` 被廣泛認知為要將回呼函式推到下一次的事件循環中優先執行，這也就解釋了為何 Next 通知會在 `just after subscribe` 之後才被發送。

Scheduler 的 `schedule()` 方法會接收一個 `delay` 參數，這參數指的是與自身內部時鐘相關連的時間長度，而 Scheduler 的時鐘與實際時鐘的時間不需要有任何關連，就像是時間運算子 `delay()` 不是根據實際時間而是根據 Scheduler 內部時鐘表示的時間來運作，而這在測試時會特別有用，其中虛擬時間的 Scheduler 可用於偽造實際時間，但實際上會同步執行排程任務。

## Scheduler 種類

`asyncScheduler` 是 RxJS 內建的 Scheduler，而下方這些都可以用 `Scheduler` 的靜態屬性來創建或返回：

| Scheduler                 | Purpose                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `null`                    | 不傳任何 Scheduler，通知會同步且遞迴地被傳送，用在恆時運算或尾遞迴運算。                                          |
| `queueScheduler`          | 在當前的事件框架（trampoline scheduler）中的佇列進行排程，用在迭代運算。                                          |
| `asapScheduler`           | 在微任務佇列中進行排程，與 Promise 使用的佇列相同，基本上會在當前事件循環最後、下次事件循環之前，用於非同步轉換。 |
| `asyncScheduler`          | 用 `setInterval` 進行排程，用於基於時間的操作。                                                                   |
| `animationFrameScheduler` | 排程任務會在下次瀏覽器的內容重新繪製前發生，可用來創造流暢的瀏覽器動畫。                                          |

## 使用 Scheduler

你可能已經在不經意的情況下在 RxJS 中使用過 Scheduler 了，這是因為所有處理併發的 Observable 都有非必須的 scheduler，如果你沒有提供特定的 scheduler 給它，它就會根據最少併發數的原則來選用預設的 scheduler，舉例來說，對於返回有限且少量訊息的 observable 的運算子，RxJS 不使用 Scheduler，即 `null` 或 `undefined`。對於返回潛在大量或無限訊息的運算子，使用 `queueScheduler`。對於使用計時器的運算子，使用 `asyncScheduler`。

由於 RxJS 使用最少並發的 Scheduler，如果您想為了性能目的引入並發性，可以選擇不同的 Scheduler。要指定特定的 Scheduler，您可以使用那些接受 Scheduler 的運算子方法，例如 `from([10, 20, 30], asyncScheduler)`。

靜態創建運算子通常接受 Scheduler 作為參數。例如，`from(array, scheduler)` 允許您指定在傳遞從陣列轉換的每個通知時要使用的 Scheduler。它通常是運算子的最後一個參數。以下靜態創建運算子接受 Scheduler 參數：

-   `bindCallback`
-   `bindNodeCallback`
-   `combineLatest`
-   `concat`
-   `empty`
-   `from`
-   `fromPromise`
-   `interval`
-   `merge`
-   `of`
-   `range`
-   `throw`
-   `timer`

使用 `subscribeOn` 來安排 `subscribe()` 調用發生的上下文。默認情況下，對 Observable 的 `subscribe()` 調用會同步且立即發生。然而，您可以使用實例運算子 `subscribeOn(scheduler)` 延遲或安排實際訂閱在指定的 Scheduler 上發生，其中 `scheduler` 是您提供的參數。

使用 `observeOn` 來安排通知傳遞的上下文。如上面的例子所示，實例運算子 `observeOn(scheduler)` 在源 Observable 和目標 Observer 之間引入了一個中介 Observer，該中介使用您提供的 scheduler 來安排對目標 Observer 的調用。

實例運算子可能接受 Scheduler 作為參數。

與時間相關的運算子如 `bufferTime`、`debounceTime`、`delay`、`auditTime`、`sampleTime`、`throttleTime`、`timeInterval`、`timeout`、`timeoutWith`、`windowTime` 都接受 Scheduler 作為最後一個參數，否則默認在 `asyncScheduler` 上運行。

其他接受 Scheduler 作為參數的實例運算子有：`cache`、`combineLatest`、`concat`、`expand`、`merge`、`publishReplay`、`startWith`。

> [!NOTE]
> `cache` 和 `publishReplay` 都接受 Scheduler，因為它們使用 `ReplaySubject`。`ReplaySubject` 的構造函數將可選的 Scheduler 作為最後一個參數，因為 `ReplaySubject` 可能處理與時間相關的操作，而這只有在 Scheduler 的上下文中才有意義。默認情況下，`ReplaySubject` 使用 `queueScheduler` 提供一個時鐘。

# Subject

RxJS 的 Subject 是一種特殊類型的 Observable，它允許值被群播至複數的 Observers，但一般的 Observable 會是單播的，也就是說，每個訂閱的 Observer 將擁有獨立的 Observable 的執行。

> Subject 就像是 Observable，但 Subject 允許群播至多個 Observers，Subject 也像是 EventEmitters，它管理著多個監聽器的註冊。

| --                | 定義                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------- |
| unicast（單播）   | 每個 Observers 都會接收到獨立的數據流，對於每個訂閱者，Observable 都會重新執行它的訂閱邏輯。 |
| multicast（群播） | 所有 Observers 共享同一個數據流。                                                            |

**所有的 Subjects 都是 Observables。** 給定一個 Subject，你可以訂閱它，提供給它一個會開始正常接收值的 Observer。但從 Observer 的視角來看，它無法分辨 Observable 的執行是來自單播的 Observable 還是群播的 Subject。

在 Subject 內部，`subscribe` 不會觸發會傳遞值的新執行，它單純地只會將傳入 `subscribe` 的 Observer 註冊到一個清單中，這與其他套件或 JS 中的 `addListener` 所做之事類似。

**所有的 Subjects 也可以是 Observers。** 要提供新的數據給 Subject，只需要呼叫 `next(newValue)`，然後新數據就會群播至每個監聽 Subject 的 Observers。

下方範例示範了附加兩個 Observers 給 Subject，然後再提供數：

```ts
import { Subject } from "rxjs";

const subject = new Subject<number>();

subject.subscribe((val) => console.log(`observerA: ${val}`));
subject.subscribe((val) => console.log(`observerB: ${val}`));

subject.next(1);
subject.next(2);

// 輸出：
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
```

當 Subject 做為 Observer 使用時，你可以將整個 Subject 做為參數傳入 Observable 的 `subscribe`，像是下面的範例：

```ts
import { Subject, from } from "rxjs";

const subject = new Subject<number>();

subject.subscribe((val) => console.log(`observerA: ${val}`));
subject.subscribe((val) => console.log(`observerB: ${val}`));

const observable = from([1, 2, 3]);

observable.subscribe(subject);

// 輸出：
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```

透過上述方法，就能將單播的 Observable 轉換成群播，而其他還有一些特規的 Subjects 像是：`BehaviorSubject`、`ReplaySubject`、以及 `AsyncSubject`。

## 群播的 Observables

一個「群播的 Observable」會通過 Subject 傳遞通知，而該 Subject 可能會有多個訂閱者，然而，「單播的 Observable」只會傳送通知給單一個 Observer。

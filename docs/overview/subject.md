# Subject

- [Subject](#subject)
  - [群播的 Observables](#群播的-observables)
    - [引用計數](#引用計數)
  - [BehaviorSubject](#behaviorsubject)
  - [ReplaySubject](#replaysubject)
  - [AsyncSubject](#asyncsubject)
  - [Void Subject](#void-subject)

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

> 一個群播的 Observable 會在底層用一個 Subject 來使數個 Observers 看到相同的 Observable 的執行。

在底層，群播的運算子 `multicast` 是這樣運作的：Observers 會訂閱一個層的 Subject，然後 Subject 會訂閱來源 Observable。下面的範例與上面的範例類似，都是使用 `observable.subscribe(subject)`：

```js
import { from, Subject, multicast } from "rxjs";

const source = from([1, 2, 3]);
const subject = new Subject();
const multicasted = source.pipe(multicast(subject));

// 這些在底層會是 `subject.subscribe(...)`
multicasted.subscribe((v) => console.log(`observerA: ${v}`));
multicasted.subscribe((v) => console.log(`observerB: ${v}`));

// 這在底層會是 `source.subscribe(subject)`
multicasted.connect();
```

`multicast` 看似會返回一個普通的 Observable，但實際上會在訂閱時像 Subject 一樣運作，而這返回的 Observable 的類別叫 `ConnectableObservable`，就單純是一個有 `connect()` 方法的 Observable 而已。

`connect()` 方法對於準確地共享 Observable 的執行時間來說很重要，因為 `connect()` 會在底層執行 `source.subscribe(subject)` 然後返回 Subscription，接著就能用 Subscription 透過取消訂閱的方式來取消共享的 Observable 的執行。

### 引用計數

手動呼叫 `connect()` 並處理 Subscription 會很麻煩，通常來說，我們會想要在第一個 Observer 抵達時自動呼叫 `connect()`，還有在最後一個 Observer 抵達時自動取消共享的的執行。

想像以下情境範例，Subscription 會按照下列清單的概述進行：

1. 第一個 Observer 訂閱了群播的 Observable
2. **群播的 Observable 已連線（connected）**
3. `next` 的值 `0` 被傳遞給了第一個 Observer
4. 第二個 Observer 訂閱了群播的 Observable
5. `next` 的值 `1` 被傳遞給了第一個 Observer
6. `next` 的值 `1` 被傳遞給了第二個 Observer
7. 第一個 Observer 取消訂閱
8. `next` 的值 `2` 被傳遞給了第二個 Observer
9. 第二個 Observer 取消訂閱
10. **群播 Observable 的練線被取消訂閱**

想要透過明確地呼叫 `connect()` 來達成上面的情境，請參考下方範例：

```ts
import { interval, Subject, multicast } from "rxjs";

const source = interval(500);
const subject = new Subject();
const multicasted = source.pipe(multicast(subject));
let subscription1, subscription2, subscriptionConnect;

subscription1 = multicasted.subscribe((v) => console.log(`observerA: ${v}`));

// 要在這裡先呼叫 `connect()`，因為 `multicasted` 的第一個訂閱者要先接收值
subscriptionConnect = multicasted.connect();

setTimeout(() => {
    subscription2 = multicasted.subscribe((v) =>
        console.log(`observerB: ${v}`)
    );
}, 600);

setTimeout(() => {
    subscription1.unsubscribe();
}, 1200);

// 這裡要取消訂閱共享的執行，因為後面不會在有新的訂閱者
setTimeout(() => {
    subscription2.unsubscribe();
    subscriptionConnect.unsubscribe(); // 取消訂閱共享的執行
}, 2000);
```

如果不想明確地呼叫 `connect()`，可以使用 `ConnectableObservable` 的 `refCount()` 方法，它會返回一個會追蹤訂閱者數量的 Observable，當訂閱者的數量從 0 變成 1 時，它就會自動呼叫 `connect()`，後面只有當訂閱者的數量從 1 變成 0 時，才會完全地取消訂閱並取消當前的執行。

> `refCount` 可以讓群播 Observable 在第一個訂閱者抵達時自動開始，然後在最後一個訂閱者離開時自動停止。

下方是使用 `refCount` 的範例：

```ts
import { interval, Subject, multicast, refCount } from "rxjs";

const source = interval(500);
const subject = new Subject();
const refCounted = source.pipe(multicast(subject), refCount());
let subscription1, subscription2;

console.log("observerA 訂閱了");
subscription1 = refCounted.subscribe((v) => console.log(`observerA: ${v}`));

setTimeout(() => {
    console.log("observerB 訂閱了");
    subscription2 = refCounted.subscribe((v) => console.log(`observerB: ${v}`));
}, 600);

setTimeout(() => {
    console.log("observerA 取消訂閱");
    subscription1.unsubscribe();
}, 1200);

setTimeout(() => {
    console.log("observerB 取消訂閱");
    subscription2.unsubscribe();
}, 2000);

// 輸出
// observerA 訂閱了
// observerA: 0
// observerB 訂閱了
// observerA: 1
// observerB: 1
// observerA 取消訂閱
// observerB: 2
// observerB 取消訂閱
```

`refCount()` 方法只會存在於 `ConnectableObservable`，並且它會返回一個 `Observable`，而不是另一個 `ConnectableObservable`。

## BehaviorSubject

`BehaviorSubject` 是 Subject 的其中一種變體，當中有一個「當前的值」的概念，它會存放發送給消費者的最新的值，不論新的 Observer 在何時訂閱，Observer 都會立即從 `BehaviorSubject` 接收到「當前的值」。

> `BehaviorSubject` 在代表「隨時間演進的值」時很實用，舉例來說，生日事件流是一個 Subject，但一個人的年齡流將是一個 BehaviorSubject。

下方範例中，BehaviorSubject 會以 `0` 作為初始化的初值，這初值會在被第一個訂閱者所接收，而第二個訂閱者會接收到 `2`，就算它是在 `2` 被發送之後才訂閱的：

```js
import { BehaviorSubject } from "rxjs";

const subject = new BehaviorSubject(0);

subject.subscribe((v) => console.log(`observerA: ${v}`));

subject.next(1);
subject.next(2);

subject.subscribe((v) => console.log(`observerB: ${v}`));

subject.next(3);

// 輸出
// observerA: 0
// observerA: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```

## ReplaySubject

`ReplaySubject` 與 `BehaviorSubject` 很類似，都可以發送舊的值給新的訂閱者，但 `ReplaySubject` 還能記錄一部分的 Observable 的執行。

> `ReplaySubject` 會記錄 Observable 執行的數個值，並將這些值發送（重播）給新的訂閱者。

當建立 `ReplaySubject` 時，你可以決定有多少個值要重播，也可以稱重播值的數量為「緩衝區大小」：

```js
import { ReplaySubject } from "rxjs";

const subject = new ReplaySubject(3); // 為新的訂閱者「緩衝」三個值

subject.subscribe((v) => console.log(`observerA: ${v}`));

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe((v) => console.log(`observerB: ${v}`));

subject.next(5);

// 輸出
// observerA: 1
// observerA: 2
// observerA: 3
// observerA: 4
// observerB: 2
// observerB: 3
// observerB: 4
// observerA: 5
// observerB: 5
```

另外，除了緩衝區大小之外，你還能設定以毫秒為單位的 `windowTime` 來決定紀錄的值所存在的時間，下方的範例會演示 `100` 單位大小的緩衝區，但緩衝值只存在 500ms：

```js
import { ReplaySubject } from "rxjs";

const subject = new ReplaySubject(100, 500 /** windowTime */);

subject.subscribe((v) => console.log(`observerA: ${v}`));

let i = 1;
setInterval(() => subject.next(i++), 200);

setTimeout(() => {
    subject.subscribe((v) => console.log(`observerB: ${v}`));
}, 1000);

// 輸出
// observerA: 1
// observerA: 2
// observerA: 3
// observerA: 4
// observerA: 5
// observerB: 3
// observerB: 4
// observerB: 5
// observerA: 6
// observerB: 6
// ...
```

## AsyncSubject

`AsyncSubject` 只會在 Observable 結束執行（Complete）時，將最後最後一個值發送給訂閱者。

```js
import { AsyncSubject } from "rxjs";

const subject = new AsyncSubject();

subject.subscribe((v) => console.log(`observerA: ${v}`));

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe((v) => console.log(`observerB: ${v}`));

subject.next(5);
subject.complete();

// 輸出
// observerA: 5
// observerB: 5
```

`AsyncSubject` 與 `last()` 運算子相似，因為它只會在 `complete` 通知發生時，才會發送一個單一值。

## Void Subject

有時候，「被發出的值」並不像「值被發出的這個事實」那麼重要。

舉例來說，下面程式碼示意已經過去了一秒：

```ts
const subject = new Subject<string>();
setTimeout(() => subject.next("dummy"), 1000);
```

像這樣發送值是一個相當笨拙的方式，而且可能會讓使用者感到困惑。

透過聲明空白的 Subject，可以起到示意被發送的值本身並不重要，重要的只是發送時的事件本身。

```ts
const subject = new Subject<void>();
setTimeout(() => subject.next("dummy"), 1000);
```

下方用完整的程式碼進行示範：

```js
import { Subject } from "rxjs";

const subject = new Subject();

subject.subscribe(() => console.log("過去了一秒鐘..."));

setTimeout(() => subject.next(), 1000);
```

> 在第七版之前，Subject 的預設泛型參數型別是 `any`，`Subject<any>` 會使後續發送的值略過型別檢查的機制，然而 `Subject<void>` 可以預防發送的值被意外的存取，倘若你想要舊有的行為還是可以使用 `Subject<any>`。

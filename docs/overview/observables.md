# Observable

- [Observable](#observable)
  - [拉取（Pull） vs 推送（Push）](#拉取pull-vs-推送push)
  - [Observables 作為函式的概論](#observables-作為函式的概論)
  - [剖析 Observable](#剖析-observable)
    - [建立 Observables](#建立-observables)
    - [訂閱 Observables](#訂閱-observables)
    - [執行 Observables](#執行-observables)
    - [處置 Observable](#處置-observable)

> Observables 是延遲推送（Push）多個值的延遲（Lazy）集合。

Observables 是一種延遲計算的資料流，它可以推送多個值。推送（Push）在這裡指的是資料的主動發送，而延遲（Lazy）則表示計算僅在需要時執行，而不是立即發生。

它們填補了下表中所缺失的位置：

| --   | Single   | Multiple   |
| ---- | -------- | ---------- |
| Pull | Function | Iterator   |
| Push | Promise  | Observable |

例如，下面是一個 Observable 在訂閱後立即推送了 1、2、3，而 4 會在訂閱後一秒被推送並同時結束：

```js
import { Observable } from "rxjs";

const observable = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    setTimeout(() => {
        subscriber.next(4);
        subscriber.complete();
    }, 1000);
});
```

如果要調用 Observable 並接收這些值，我們需要訂閱它：

```js
// ...

console.log("訂閱前");
observable.subscribe({
    next(x) {
        console.log("接收到值 => " + x);
    },
    error(err) {
        console.error("有錯誤發生了 => " + err);
    },
    complete() {
        console.log("結束");
    },
});
console.log("訂閱後");
```

若執行上面所有程式碼，會得出以下結果：

```txt
訂閱前
接收到值 => 1
接收到值 => 2
接收到值 => 3
訂閱後
接收到值 => 4
結束
```

## 拉取（Pull） vs 推送（Push）

拉取（Pull）和推送（Push）是兩種不同的協議，描述了資料生產者如何與資料消費者通訊。

| --           | 生產者                       | 消費者                           |
| ------------ | ---------------------------- | -------------------------------- |
| 拉取（Pull） | **被動**：請求時產生資料     | **主動**：決定何時請求資料       |
| 推送（Push） | **主動**：依自身步調生產資料 | **被動**：對接收到的資料做出反應 |

-   **拉取（Pull）**

    在拉取的機制中，消費者決定甚麼時候從生產者那裡接收資料，生產者本身不會知道資料甚麼時候會被傳遞給消費者。

    在 JS 中所有函式的運作都是一個拉取系統，函式是一個資料生產者，呼叫函式的程式碼透過從呼叫進而從函式「拉出」返回值的行為被稱為消費：

    ```js
    // 生產者
    function getData() {
        return "data";
    }

    // 消費者拉取資料
    const dataA = getData();
    const dataB = getData();
    ```

    而 JS 中另外一種拉取系統，是 ES2015 所引入的生成器函式與迭代器（`function*`），而 `iterator.next()` 這段程式碼是消費者，它會從迭代器（生產者）中「拉出」數個值：

    ```js
    // 生產者
    function* generator(i) {
        yield i;
        yield i + 10;
    }

    const gen = generator(10);

    // 消費者拉取資料
    console.log(gen.next().value);
    console.log(gen.next().value);
    ```

-   **推送（Push）**

    推送的機制中，資料生產者決定何時向消費者傳送資料，消費者不知道甚麼時候會接收到資料。

    Promises 就是 JS 裡一種典型的推送系統，資料生產者 Promise 會傳遞解析過的資料給回調函式，而且與一般函式不同的是，Promise 會負責決定資料何時會被「推送」給回調函式：

    ```js
    // 生產者
    const promise = new Promise((resolve) => {
        // 推送
        resolve("data");
    });

    // 消費者接收資料
    promise.then((data) => console.log(data));
    ```

RxJS 引入了一個新的推送機制「Observables」給 JS，Observable 是複數資料的生產者，會將資料推送給資料消費者（Observers）。

以下是 Observable 與其它現存於 JS 的資料生產與消費機制的差異：

-   **Function** 是一種在呼叫時同步執行並返回一筆資料的延遲計算。
-   **Generator** 是一種在迭代時會同步執行並返回 0 到多筆資料的延遲計算。
-   **Promise** 是一種最終可能會（或不會）返回一筆資料的計算。
-   **Observable** 是一種會在被調用的那一刻起，同步或非同步執行並返回 0 到多筆資料的延遲計算。

## Observables 作為函式的概論

與流行的說法相反，Observables 不像是 EventEmitters 或可解析多個值的 Promises，它可能會在某些情境下與 EventEmitters 有類似的行為，像是透過 RxJS 的 Subjects 進行群播時，但通常情況下它與 EventEmitters 的行為不會一樣。

> Observables 就像是不接收參數的函式，但進一步擴展了其功能，允許傳遞多個值。

若是有以下的程式碼：

```js
function foo() {
    console.log("Hello");
    return 42;
}

const x = foo.call(); // 與 foo() 相同
console.log(x);
const y = foo.call(); // 與 foo() 相同
console.log(y);
```

我們期望的輸出結果是：

```txt
"Hello"
42
"Hello"
42
```

但我們可以用 Observables 嘗試復現同樣的行為，並擁有相同的輸出結果：

```js
import { Observable } from "rxjs";

const foo = new Observable((subscriber) => {
    console.log("Hello");
    subscriber.next(42);
});

foo.subscribe((x) => console.log(x));
foo.subscribe((y) => console.log(y));
```

而之所以上面兩個範例會有同樣的結果，是因為它們都是一種延遲計算。

在函式中，如果你不呼叫它，`console.log("Hello")` 就不會執行，而同樣的行為也會在 Observable 中出現，但是是以訂閱（subscribe）的形式來呼叫。

另外，不管「呼叫」或「訂閱」都是一種獨立操作，呼叫兩次函式就會觸發兩次函式的副作用，而訂閱兩次 Observable 也會有相同情況，所以跟 EventEmitters 不同的是，EventEmitters 無論訂閱者是否存在，它們都會共享副作用並立即執行，而 Observables 是延遲的且沒有共享執行。

> 訂閱 Observables 與呼叫函式是類似的行為。

有些人聲稱 RxJS 不是同步的，但那是錯的，以下示範用 `console.log` 包裹住 Observable 的訂閱行為，你會得到與包裹住函式執行相同的結果：

```js
console.log("前");
foo.subscribe((x) => console.log(x)); // or foo.call();
console.log("後");
```

輸出結果：

```txt
"前"
"Hello"
42
"後"
```

這就證明了「訂閱」這動作與函式一樣完全就是同步的。

> Observables 能夠以同步或非同步的方式傳遞資料。

那 Observable 與一般函式有哪裡不一樣嗎？Observables 可以隨著時間推移「返回」不同的值，這是函式所做不到的，例如下面這段程式碼，函式只能有一種返回值：

```js
function foo() {
    console.log("Hello");
    return 42;
    return 100; // 死代碼，永不發生
}
```

但是 Observables 可以做到這樣，甚至能有非同步的返回值：

```js
import { Observable } from "rxjs";

const foo = new Observable((subscriber) => {
    console.log("Hello");
    subscriber.next(42);
    subscriber.next(100); // 「返回」另一個值
    subscriber.next(200); // 再「返回」另一個值
    setTimeout(() => {
        subscriber.next(300); // 延遲推送一個值
    }, 1000);
});

console.log("前");
foo.subscribe((x) => console.log(x));
console.log("後");
```

並同時存在同步與非同步的輸出結果：

```txt
"前"
"Hello"
42
100
200
"後"
300
```

## 剖析 Observable

Observables 會透過 `new Observable` 或一個建立運算子來**建立**，並使用 Observer 來**訂閱**，**執行**時 Observable 會傳遞 `next`、`error`、`complete` 等通知給 Observer，並且 Observer 能夠**處置** Observable 的執行。

Observable 的核心關注點：

-   **建立（Creating）**
-   **訂閱（Subscribing）**
-   **執行（Executing）**
-   **處置（Disposing）**

### 建立 Observables

`Observable` 類別接收一個參數，一個 `subscribe` 函式。

下列範例會建立一個每秒推送一次 `"hi"` 給訂閱者的 Observable：

```js
import { Observable } from "rxjs";

const observable = new Observable(function subscribe(subscriber) {
    const id = setInterval(() => {
        subscriber.next("hi");
    }, 1000);
});
```

> 雖然可以用 `new Observable` 來建立 Observable，但更常見的情況是透過建立運算子（`of`, `from`, `interval`, etc）來建立。

上述的範例中，`subscribe` 函式是描述 Observable 最重要的部分，而下面接續介紹訂閱行為。

### 訂閱 Observables

你可以像下面這樣訂閱 `observable`：

```js
observable.subscribe((x) => console.log(x));
```

`observable.subscribe` 與建立 `observable` 時的 `function subscribe` 名稱相同並不是巧合，從整個套件的角度來看，它們的確不相同，但若是從一些特定目的的角度出發，你可以將它們視為相同概念。

這顯示了同一個 Observable 下的 `subscribe` 如何在不同 Observers 間互不共享，當透過 Observer 呼叫了 `observable.subscribe`，`new Observable` 裡的 `function subscribe` 會為那些訂閱者執行，`observable.subscribe` 每次的呼叫會觸發它單獨的配置給訂閱者。

> 訂閱一個 Observable 就像呼叫一個函式，並將 Observable 提供的資料傳遞給回調函式。

這就與事件處理器 APIs（`addEventListener`, `removeEventListener`）徹底不同了，透過 `observable.subscribe`，Observer 並沒有像監聽器一樣被註冊在 Observable 上，Observable 甚至不會持有一份附加的 Observers 清單。

`subscribe` 的呼叫，就單純是一個**開始執行 Observable 的方法**，並在執行時傳遞值或事件給 Observer。

### 執行 Observables

`new Observable(function subscribe(subscriber) {...})` 裡的程式碼代表著「Observable 的執行」，一個只會在各個 Observer 訂閱時才會發生的延遲計算，並會在執行時隨著時間同步或非同步地產生多個值。

Observable 執行時可以傳遞三種類型的值：

-   Next 通知：傳送一般的值，像是 `string`、`number`、`object` ...等等。
-   Error 通知：傳送 JS 錯誤或例外。
-   Complete 通知：不傳送任何值。

Next 通知是最重要且最常見一種類型，它代表著傳遞給訂閱者的實際資料，而 Error 與 Complete 通知只會在執行時擇一發生，並只會發生一次。

> 在執行 Observable 時，可能會有 0 到無限個 Next 通知被傳遞，但若是 Observable 傳遞了 Error 或 Complete 通知，那麼在這之後 Observable 將無法在傳遞任何東西。

下面範例示範了 Observable 先傳遞三個 Next 再傳遞一個 Complete，之後再嘗試傳遞一次 Next，你會發現最後一次的 Next 並不會被傳遞：

```js
import { Observable } from "rxjs";

const observable = new Observable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
    subscriber.next(4); // 這不會被傳遞給訂閱者
});
```

另外，你可以用 `try...catch` 來包覆住可能會拋出錯誤的程式碼，並且在錯誤發生時傳遞 Error 通知：

```js
import { Observable } from "rxjs";

const observable = new Observable((subscriber) => {
    try {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.complete();
    } catch (err) {
        subscriber.error(err);
    }
});
```

### 處置 Observable

因為 Observable 可能會被執行無限多次，並且 Observer 想要在有限的時間內中斷執行是很常見的事，所以我們需要一個 API 來取消執行。

由於每一次的執行都單獨屬於一個 Observer，只要 Observer 完成了接收資料的任務，就需要一個方法來停止執行，這是為了要避免浪費算力或是記憶體資源。

當 `observable.subscribe` 被呼叫時，Observer 會附加到新創建的 Observable 的執行中，此次呼叫同時會返回一個 Subscription 物件：

```js
const subscription = observable.subscribe((x) => console.log(x));
```

Subscription 代表著正在進行的執行，它同時包含最簡易的 API 來讓你取消該次的執行，這邊示範用 `
subscription.unsubscribe()` 來取消正在進行當中的執行：

```js
import { from } from "rxjs";

const observable = from([10, 20, 30]);
const subscription = observable.subscribe((x) => console.log(x));

// ...等會兒
subscription.unsubscribe();
```

每個 Observable 都必須定義怎麼處置透過 `new Observable` 創建的資源，你可以在 `function subscribe` 當中返回一個客製化的 `unsubscribe` 函式來達成這件事。

舉例來說，以下是一個清除定時器的範例：

```js
import { Observable } from "rxjs";

const observable = new Observable((subscriber) => {
    const id = setInterval(() => {
        subscriber.next("hi");
    }, 1000);

    return () => {
        clearInterval(id);
    };
});
```

就像 `observable.subscribe` 類似於 `function subscribe` 一樣，`unsubscribe` 也與 `
subscription.unsubscribe` 在概念上相等。

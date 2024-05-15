# RxJS

## 簡介

RxJS 是一款套件，以可觀察序列構成非同步以及事件驅動程式，它擁有一個核心類型（Observable）、數個輔助類型（Observer, Schedulers, Subjects）以及運算子（map, filter, reduce, every, etc），可以過這些類型與運算子以集合的方式來處理非同步事件。

> 想像 RxJS 是用於「事件」的 Lodash

ReactiveX 結合了觀察者模式與迭代器模式以及函數型編程與集合，為了要以理想的方式來管理事件序列。

在 RxJS 中解決了非同步事件管理的重要概念有：

- **Observable**：未來值或事件的可呼叫集合。
- **Observer**：是一個回調函數的集合，知道該怎麼監聽從 Observable 傳遞過來的值。
- **Subscription**：是 Observable 的執行者，主要用來取消執行。
- **Operators**：純函數，允許以函數型編程的風格來處理集合。
- **Subject**：與 EventEmitter 等效，並且是將值或事件群播給 Observers 的唯一方式。
- **Schedulers**：是控制併發的中央派遣程序，允許我們在計算發生時進行協調，例如 `setTimeout` 或 `requestAnimationFrame` 或其他。

## 範例

過往掛載事件監聽時：

```js
document.addEventListener("click", () => console.log("Clicked!"));
```

使用 RxJS 的話要用 observable 替代：

```js
import { fronEvent } from "rxjs";

fromEvent(document, "click")
    .subscribe(() => console.log("Clicked!"));
```

### 純粹性

RxJS 之所以強大在於它能透過純函式來產生值，使程式碼不太容易出錯。

過往的程式碼中，你可能會因為其他程式碼而擾亂了狀態的變動：

```js
let count = 0;
document.addEventListener("click", () => console.log(`Clicked ${++count} times`));
```

但透過 RxJS 你可以將狀態獨立出來：

```js
import { fromEvent, scan } from "rxjs";

fromEvent(document, "click")
    .pipe(scan((count) => count + 1, 0))
    .subscribe((count) => console.log(`Clicked ${count} times`));
```

> `scan` 運算子就像是陣列的 `reduce` 方法，它需要一個傳遞給回調函數的值，而返回值將會成為下次回調函數運行時的新的傳遞值。# rxjs-course

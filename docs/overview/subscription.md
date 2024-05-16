# Subscription

Subscription 是一個代表一次性資源的物件，通常是 Observable 的執行，它有一個最重要的方法「`unsubscribe`」，這方法不需要參數，功能也只有在被調用時將 Subscription 握有的資源清除掉。

```js
import { interval } from "rxjs";

const observable = interval(1000);
const subscription = observable.subscribe((x) => console.log(x));

// ...等會兒
subscription.unsubscribe();
```

> Subscription 重要的只有透過 `unsubscribe()` 來釋放資源或取消 Observable 的執行而已。

Subscription 也可以被放在一起，這樣你就可以透過其中一個的 `unsubscribe()` 來釋放所有被綁定的 Subscription，而想要把 Subscription 結合需要使用 `add` 方法：

```js
import { interval } from "rxjs";

const observable1 = interval(400);
const observable2 = interval(300);

const subscription = observable1.subscribe((x) => console.log("first: " + x));
const childSubscription = observable2.subscribe((x) =>
    console.log("second: " + x)
);

subscription.add(childSubscription);

setTimeout(() => {
    // 這會一次釋放調兩個 subscription
    subscription.unsubscribe();
}, 1000);
```

Subscription 還有一個 `remove(subscription)` 的方法，可以用來解除綁定。

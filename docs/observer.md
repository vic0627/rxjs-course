# Observer

Observer 是一個資料消費者，它會接收從 Observable 傳遞過來的資料。

Observers 單純就是一組回調函式，接收 Observable 傳遞過來的三種通知（`next`, `error`, and `complete`）的任一種。

下面是一個典型的 Observer 物件：

```js
const observer = {
    next: (x) => console.log(`Observer 接收到一個 next： ${x}`),
    error: (err) => console.error(`Observer 接收到一個 error： ${err}`),
    complete: () => console.log("Observer 接收到一個 complete 通知。"),
};
```

使用 Observer 時，請將它提供給 Observable 的訂閱方法 `subscribe`：

```js
observable.subscribe(observer);
```

> Observers 就是一個有三種回調函式的物件而已，每種通知類型剛好會對應一個回調函式。

Observers 物件的各個屬性都可以被省略，假設說你省略了 next 回調函式，那麼 Observable 執行時就只是接收不到 next 的通知而已，但不影響 Observable 的執行。

你也可以直接傳遞一個函式作為 Observer 物件，那麼該函式將被視作 next 通知的回調：

```js
observable.subscribe((x) => console.log(x));
```

在 `observable.suscribe` 內部，它會利用接收到的函式創建一個 `Observer` 物件。

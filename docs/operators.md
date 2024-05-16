# Operators

就算 Observable 是 RxJS 的基底，但最好用的就是它一系列的運算元，運算元是很重要的一部分，它能夠以聲明的方式輕易地組成相當複雜的非同步程式碼。

## 什麼是運算元？

運算元是函式，它有兩種類型：

-   **管道運算元 Pipeable Operators**

    管道運算元是一種可以通過 `observableIstance.pipe(operator)`（或是更常見的 `observableInstance.pipe(operatorFactory())`）語法來串接 Observable 的一種函式，而運算元工廠包括 `filter(...)` 與 `mergeMap(...)`。

    當管道運算元被呼叫時，它們不會改變現存的 Observable 實例，取而代之的是，它們會返回新的 Observable，而新的 Observable 的訂閱邏輯也會基於原始的 Observable。

    > 管道運算元是一個會將 Observable 作為它的輸入的函式，並且會返回新的 Observable。管道運算元同時是一個純函式，先前的 Observable 並不會被它給編輯。

    > 管道運算元工廠是一個可以接收參數來改變上下文的函式，並且會返回一個管道運算元，該工廠的參數會屬於運算元的語彙範疇。

    管道運算元最重要的觀念是，**它是一個純函式**，並接收一個 Observable 作為輸入，並產生另一個 Observable 作為輸出，當訂閱輸出的 Observable 的同時也會訂閱輸入的 Observable。

-   **創建運算元 Creation Operators**

    創建運算元是另一種類型的運算元，它可以單獨被呼叫來建立新的 Observable 更詳細的說明會在後面區塊提及。

    例如，`of(1, 2, 3)` 會建立一個會依序發送 `1`、`2`、`3` 的 Observable，再透過 `map` 管道運算元，將每個值平方，最後將輸出 `1`、`4`、`9`：

    > `map` 與陣列方法同名且類似功能的一個函式。

    ```js
    import { of, map } from "rxjs";

    of(1, 2, 3)
        .pipe(map((x) => x * x))
        .subscribe((v) => console.log(`value: ${v}`));

    // 輸出
    // value: 1
    // value: 4
    // value: 9
    ```

    而另外有一個實用的函式叫 `first`：

    ```js
    import { of, first } from "rxjs";

    of(1, 2, 3)
        .pipe(first())
        .subscribe((v) => console.log(`value: ${v}`));
    ```

    從邏輯上來說，`map` 必須動態建構（呼叫），因為需要提供映射函數作為參數給它，而相比之下，`first` 可以是一個常數，意味著它並沒有強制需要傳入任何參數，但仍然是動態建構的。

    一般來說，所有運算元都必須有建構（呼叫）的動作，無論它是否需要參數。

## 串接

管道運算元都是函式，所以它們可以像一般函式調用（例如：`op()(obs)`，而 `obs` 代表著 Observable），但實務上來說，存在多組運算元時，它們彼此之間比起串接，更像是互相嵌套，並且程式碼會在嵌套的過程中逐漸變得不可讀（例如：`op4()(op3()(op2()(op1()(obs))))`），正因如此，Observables 才有一個方法 `.pipe()`，增加程式碼可讀性的同時也確保功能上能完成相同的嵌套需求：

```js
obs.pipe(op1(), op2(), op3(), op4());
```

而從風格的角度切入，`op()(obs)` 這種做法永遠不要使用，就算你只對 Observable 使用一個運算元。

## 創建運算元

與管道運算元不同，創建運算元是可以用來建立 Observable，這個 Observable 會有著預先定義的行為，或是與其它 Observable 結合。

一個典型的範例，就是 `interval` 運算元，它需要一個數字作為參數，然後會返回一個 Observable：

```js
import { interval } from "rxjs";

const observable = interval(1000 /** ms */);
```

## 高階 Observables

最常見的情況下，Observables 會發送一般的值像是 `string` 或 `number`，但令人驚訝的是，需要處理到 Observables 中的 Observables 的情境卻很常見，也就是所謂的高階 Observables。

例如，想像一下，你有一個會發送多組檔案的 URL 的 Observables，程式碼可能會像下面這樣：

```js
const fileObservable = urlObservable.pipe(map((url) => http.get(url)));
```

`http.get()` 會根據各個 URL 返回一個 Observable，這時你就有了高階 Observables 了。

那要怎麼處理高階 Observables 呢？典型的處理方式是透過扁平化，將高階的 Observables 轉換成一般的 Observables，例如說：

```js
const fileObservable = urlObservable.pipe(
    map((url) => http.get(url)),
    concatAll()
);
```

`concatAll()` 運算元會訂閱來自「外層」 Observable 內的每個「內部」的 Observable，並複製所有被發送的值，直到那個 Observable 結束，然後再往下一個 Observable，所有的值都是透過這種方式串連。

其他一些實用的運算元有：

- `mergeAll()`：
- `switchAll()`：
- `exhaustAll()`：
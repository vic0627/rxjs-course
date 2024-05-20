# Subject

RxJS 的 Subject 是一種特殊類型的 Observable，它允許值被群播至複數的 Observers，但一般的 Observable 會是單播的，也就是說，每個訂閱的 Observer 將擁有獨立的 Observable 的執行。

> Subject 就像是 Observable，但 Subject 允許群播至多個 Observers，Subject 也像是 EventEmitters，它管理著多個監聽器的註冊。

**所有的 Subjects 都是 Observables。**給定一個 Subject，你可以訂閱它，提供給它一個會開始正常接收值的 Observer。但從 Observer 的視角來看，它無法分辨 Observable 的執行是來自單播的 Observable 還是群播的 Subject。


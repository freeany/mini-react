## V1

### 创建元素的三步

1. createElement、 createTextNode
2. 设置 props
3. 让父节点 append 当前创建的 dom。

### 虚拟 dom

1. 先创建虚拟 dom 节点
2. render 函数递归
3. 完成`ReactDOM.createRoot(document.querySelector('#root')).render(App)`的格式

## v2

### 问题

1. 如何使用 jsx 替代 js 的写法
2. 如何借助 vite 实现 jsx 的解析

实现：

- jsx有一套约定的翻译方法，就是解析成React.createElement

- 使用 vite 将 jsx 转换成 js。
  - vite 会将`const App = <div id="app">mini-react</div>`转换为`React.createElement('div', { id: 'app' }, 'app', 'mini-react')`, 它会在当前模块中去找 React.createElement 这个方法，如果没有则报错。
  - 而导入 jsx 文件，也会去找 React 这个变量，没有则报错。

### 自定义 react名称

告诉 vite 的编译器将 React 变成 CReact
在 jsx 文件 的第一行加上 `/**@jsx CReact.createElement */`，术语叫做 js pragma



## V3

### 问题：

Q: 我们现在 render 函数是采用的递归的方式，但是递归的方式会造成卡顿，这是为什么？

A: 递归不可被中断，如果页面层级过多会导致 js 代码占用线程时间过长，影响页面的渲染。而且如果此时用户去做其他的dom操作，主线程将无法及时响应，造成卡顿。javascript脚本不能与浏览器布局、绘制、渲染同时执行。浏览器需要在16.67毫秒内完成js代码、布局、绘制，才会不卡顿。

浏览器每一帧要做的事

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/038ea55906694169b3fed2760ba60e7c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)



如何解决呢？

将多个大任务拆分到多个task里面完成。采用requestIdleCallback分帧运算。

解释： 假设某一帧中的任务不多，在不到16.67ms中完成了上述任务，那么这一帧就会有一定的空闲时间在执行**requestIdleCallback**的回调。

```js
const el = document.createElement('div')
el.innerText = 'hi'
document.body.append(el)

let i = 0
while (i < 10000000) {
  i ++
} 
```

上面的代码会发生卡顿。

之前是一次性把整颗dom树都渲染出来，那是否可以在每个任务中只去渲染两个dom呢？ 那么这样的话就不会有过多的js逻辑去执行了，就不会阻塞每一帧的渲染了。



### 新的问题

Q: 如何做到每次只渲染几个节点呢？在下次执行的时候依然从之前的位置执行？

A: 把树结构转变成链表结构



#### 实现任务调度器）

所谓任务调度器就是指在主线程有空闲的时候插入任务。在组件的生成和更新的过程可以中断和恢复。允许主线程去响应更高级别更紧急的任务，如响应用户的输入。



我们先完成一个dom的渲染，然后在检测剩余时间， 如果时间足够的话才应该去渲染另外一个dom。这种结构是依次渲染的，用链表。

如何把dom树结构转换成链表结构？

树遍历转化链表：

-  root => child => sibling => 叔叔节点

将虚拟dom一边拆解成链表一边渲染dom节点。

实现：

实现PerformUnitOfWork(在每一帧的空闲时间要做什么？)

1. 创建dom
2. 把dom添加到父级容器
3. 设置dom的props
4. 将没有虚拟dom转换成链表，设置好指针，child 、sibling、parent的关系。
5. 返回下一节点



![image-20240328181004160](/Users/lihaoran/Library/Application Support/typora-user-images/image-20240328181004160.png)

以上的内容是react团队提出的fiber架构，其主要特性有：

1. **增量渲染**：Fiber 使 React 能够将渲染工作分割成多个块，并将这些工作块分散到多个帧上执行。
2. **任务优先级**：Fiber 能够根据任务的优先级进行工作，重要的更新可以优先处理，而不重要的任务可以推迟。
3.  **更平滑的用户界面**：通过避免长时间阻塞主线程，Fiber 有助于保持应用的流畅性和响应性。
4. **并发模式**：Fiber 架构为 React 的未来并发模式打下基础，即使在复杂的应用中也能保持稳定的性能。



在旧的react架构中(Stack Reconciler),  渲染和更新过程是递归进行的，且一旦开始就不可被中断，而且react必须要在一帧内完成整个更新，否则可能会导致用户界面的延迟和卡顿。

而在fiber架构中，将渲染的过程分成多个小任务执行，每个小任务完成后，React会检查是否有更高优先级的工作需要处理，如果有，react会中断当前工作，转而执行高优先级的任务。这种方式使得React的更新方式更为灵活，更好的去匹配浏览器的帧率，提高了用户体验。



## v4

目标： 统一提交

问题： 中途有可能没空闲时间，用户会看到渲染一半的dom。

解决思路：计算结束后统一添加到屏幕里面。



大白话： 

![image-20240328192108014](/Users/lihaoran/Library/Application Support/typora-user-images/image-20240328192108014.png)

按照上面我们做的东西渲染上面这个dom结构的时候有可能会发生这样的情况，B组件是个按钮执行一些东西， 当我们分块渲染的时候，可能渲染好A，B，C之后用户点击了B组件的按钮，去执行更高优先级的任务，假如这个任务两秒，那么有可能会发生这样的事情，页面呈现出来了A、B、C，等两秒+之后才去呈现D、E、F。那么针对这个问题如何去解决？
我们现在做的版本是每个任务都去append到dom里。这是问题出现的关键点。

所以我们可以在最后统一的去append到dom中。

最后指的是： 什么时候处理完链表？

append的dom： 需要知道根节点。



## v5

目标： 支持function component

解决思路： 把fc当成一个盒子

实现：

1. type的处理
2. 区分fc和非fc
3. 添加到视图的处理。

![image-20240328231911896](/Users/lihaoran/Library/Application Support/typora-user-images/image-20240328231911896.png)



## v6重构


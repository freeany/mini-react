function work(deadline) {
	console.log(`当前帧剩余时间: ${deadline.timeRemaining()}`)
	if (deadline.timeRemaining() > 1 || deadline.didTimeout) {
		// 走到这里，说明时间有余，我们就可以在这里写自己的代码逻辑
		console.log('执行自己的逻辑')
	}
	console.log('没时间了')
	// 走到这里，说明时间不够了，就让出控制权给主线程，下次空闲时继续调用
	requestIdleCallback(work)
}
requestIdleCallback(work, { timeout: 1000 }) // 这边可以传一个回调函数（必传）和参数（目前就只有超时这一个参数）

const work1 = document.createElement('div')
work1.innerText = 'hi'
document.body.append(work1)

let i = 0
while (i < 10000000) {
	i++
}

console.log(123)

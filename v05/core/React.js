// 创建vdom
function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map(child => {
				const isTextNode = typeof child === 'string' || typeof child === 'number'
				return isTextNode ? createTextNode(child) : child
			})
		}
	}
}
// 创建vdom
function createTextNode(text) {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: [] // 这里不可能有children，只是为了方便处理该数据结构
		}
	}
}

let root = null // 第一个任务
/**
 *
 * @param {*} el 是虚拟dom
 * @param {*} container html元素容器
 */
function render(el, container) {
	nextWorkOfUnit = {
		dom: container,
		props: {
			children: [el]
		}
	}
	root = nextWorkOfUnit
	// const dom =
	// 	el.type === 'TEXT_ELEMENT'
	// 		? document.createTextNode(el.props.nodeValue)
	// 		: document.createElement(el.type)
	// const props = el.props
	// Object.keys(props).forEach(key => {
	// 	if (key !== 'children') {
	// 		dom[key] = props[key]
	// 	} else {
	// 		props.children.forEach(child => {
	// 			render(child, dom)
	// 		})
	// 	}
	// })
	// container.append(dom)
}

function createDom(type) {
	return type === 'TEXT_ELEMENT'
		? document.createTextNode('')
		: document.createElement(type)
}
function updateProps(dom, props) {
	Object.keys(props).forEach(key => {
		if (key !== 'children') {
			dom[key] = props[key]
		}
	})
}
function initChildren(fiber, children) {
	let prevChild = null // 上一个child
	children.forEach((child, index) => {
		// 创建一个新对象来保存parent
		const newFiber = {
			type: child.type,
			props: child.props,
			child: null,
			parent: fiber,
			sibling: null,
			dom: null
		}
		if (index === 0) {
			fiber.child = newFiber
		} else {
			// 将child绑定他的兄弟child
			prevChild.sibling = newFiber
		}
		prevChild = newFiber
	})
}
function performanceWorkOfUnit(fiber) {
	const isFunctionComponent = typeof fiber.type === 'function'
	// 当不是fc的时候才需要创建dom
	if (!isFunctionComponent) {
		if (!fiber.dom) {
			// 1. 创建dom
			const dom = (fiber.dom = createDom(fiber.type))
			// fiber.parent.dom.append(dom) // 添加到父节点
			// 2. 处理props
			updateProps(dom, fiber.props)
		}
	}

	// 3. 将children的关系转换链表，设置好指针
	const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children

	initChildren(fiber, children)
	// 4. 返回下一个要执行的任务
	if (fiber.child) {
		return fiber.child
	}
	// if (fiber.sibling) {
	// 	return fiber.sibling
	// }

	// return fiber.parent?.sibling
	let nextFiber = fiber
	while (nextFiber) {
		if (nextFiber.sibling) return nextFiber.sibling
		nextFiber = nextFiber.parent
	}
	// 如果return undefined那么就代表所有的节点都处理完了。
}

function commitRoot() {
	commitWork(root.child)
	root = null
}
function commitWork(fiber) {
	if (!fiber) return
	// fiber.parent.dom.append(fiber.dom)
	// console.log(fiber)
	// 因为Counter函数的dom是null，所以Couter函数中的div需要向上去找
	let fiberParent = fiber.parent
	// 嵌套函数的情况需要while循环去找
	while (!fiberParent.dom) {
		fiberParent = fiberParent.parent
	}

	if (fiber.dom) {
		fiberParent.dom.append(fiber.dom)
	}
	commitWork(fiber.child)
	commitWork(fiber.sibling)
}

// 当前执行的任务
let nextWorkOfUnit = null

// 每一帧剩余时间要做的事
function workLoop(deadline) {
	let shouldYield = false
	// 当前任务必须有值才会继续。因为当执行到最后一个的时候可能还会调用这个函数，但此时nextWorkOfUnit是undefined
	while (!shouldYield && nextWorkOfUnit) {
		// 返回下一个任务
		nextWorkOfUnit = performanceWorkOfUnit(nextWorkOfUnit)

		shouldYield = deadline.timeRemaining() < 1
	}

	// 处理完链表中的数据了, root 必须存在因为要保证添加到视图的这个动作只执行一次
	if (!nextWorkOfUnit && root) {
		// 开始提交
		commitRoot()
	}

	requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)

export default {
	createElement,
	render
}

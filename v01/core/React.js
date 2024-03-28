// 创建vdom
function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map(child =>
				typeof child === 'string' ? createTextNode(child) : child
			)
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

/**
 *
 * @param {*} el 是虚拟dom
 * @param {*} container html元素容器
 */
function render(el, container) {
	const dom =
		el.type === 'TEXT_ELEMENT'
			? document.createTextNode(el.props.nodeValue)
			: document.createElement(el.type)

	const props = el.props
	Object.keys(props).forEach(key => {
		if (key !== 'children') {
			dom[key] = props[key]
		} else {
			props.children.forEach(child => {
				render(child, dom)
			})
		}
	})

	container.append(dom)
}

export default {
	createElement,
	render
}

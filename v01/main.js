import ReactDOM from './core/ReactDOM.js'
import React from './core/React.js'
// const textEl = createTextNode('app')
const App = React.createElement('div', { id: 'app' }, 'app', 'mini-react')
console.log(App)

ReactDOM.createRoot(document.querySelector('#root')).render(App)

// 思考如何使用jsx？

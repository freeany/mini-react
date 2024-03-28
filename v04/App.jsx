/**@jsx CReact.createElement */
import CReact from './core/React.js'
// const textEl = createTextNode('app')
// const App = React.createElement('div', { id: 'app' }, 'app', 'mini-react')

function testApp() {
	return <div id="app">mini-react</div>
}
const App = (
	<div id="app">
		mini-react <span>22</span>
	</div>
)
console.log(testApp)

export default App

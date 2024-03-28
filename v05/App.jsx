/**@jsx CReact.createElement */
import CReact from './core/React.js'
// const textEl = createTextNode('app')
// const App = React.createElement('div', { id: 'app' }, 'app', 'mini-react')

function Counter({ num }) {
	return <div>Counter---{num}</div>
}
function CouterContainer() {
	return <Counter></Counter>
}
function App() {
	return (
		<div id="app">
			mini-react
			<Counter num={10}></Counter>
			<Counter num={30}></Counter>
			{/* <CouterContainer></CouterContainer> */}
		</div>
	)
}

export default App

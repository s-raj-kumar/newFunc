import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Tshirt from '../components/Tshirt'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Plots from '../components/Plots'

function App() {
  const [count, setCount] = useState(0)

  return (
      <BrowserRouter >
      <Routes>
        <Route path='/' element={<Tshirt />}/>
        <Route path='/showgraphs/:tableName' element={<Plots />}/>
      </Routes>
      </BrowserRouter>
  )
}

export default App

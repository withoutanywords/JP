import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/App.css'
import './styles/mobile.css'
import Home from './pages/Home'
import Camera from './pages/Camera'
import Classify from './pages/Classify'
import Success from './pages/Success'

function App() {
  const [image, setImage] = useState(null)
  const [classification, setClassification] = useState(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/camera" element={<Camera setImage={setImage} />} />
        <Route path="/classify" element={<Classify image={image} setClassification={setClassification} />} />
        <Route path="/success" element={<Success classification={classification} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

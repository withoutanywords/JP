import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="container">
      <NavBar />
      <div className="home">
        <div className="home-illustration">🤖</div>
        <h2>AI 분리수거 탐정단</h2>
        <p>쓰레기를 찍으면 AI가 분류를 도와줍니다!<br/>
        함께 지구를 지켜봅시다 🌍</p>
        <button
          className="start-button"
          onClick={() => navigate('/camera')}
        >
          탐정 미션 시작하기! 🔍
        </button>
      </div>
    </div>
  )
}

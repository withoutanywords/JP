import { useNavigate } from 'react-router-dom'

export default function NavBar() {
  const navigate = useNavigate()

  return (
    <div className="navbar">
      <h1 onClick={() => navigate('/')}>🤖 AI 분리수거 탐정단</h1>
      <div className="navbar-menu">
        <a onClick={() => navigate('/')}>홈</a>
        <a>탐정단 소개</a>
        <a>재활용 교육</a>
      </div>
    </div>
  )
}

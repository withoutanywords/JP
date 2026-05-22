import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function Success({ classification }) {
  const navigate = useNavigate()
  const location = useLocation()

  // location.state에서 classification 받기 (또는 props에서 받기)
  const classData = location.state || classification
  const [fireworks, setFireworks] = useState([])

  useEffect(() => {
    if (!classData) {
      navigate('/camera')
      return
    }

    // 축하 불꽃 효과
    const generateFireworks = () => {
      const works = []
      for (let i = 0; i < 8; i++) {
        works.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.3
        })
      }
      setFireworks(works)
    }

    generateFireworks()
    const timer = setInterval(generateFireworks, 2000)

    return () => clearInterval(timer)
  }, [classData, navigate])

  if (!classData) {
    return null
  }

  const isCorrect = classData.correct

  return (
    <div className="container">
      <NavBar />
      <div className="success">
        <div className="success-illustration">
          {isCorrect ? '✨' : '🎉'}
        </div>

        <h2>
          {isCorrect
            ? '참 잘했어요, 대장 탐정님!'
            : '다시 한번 도전해봐요!'}
        </h2>

        {isCorrect && (
          <>
            <div className="medal">🏅</div>
            <p>지구 지킴이 메달을 획득했습니다!</p>
          </>
        )}

        {!isCorrect && (
          <div>
            <p>당신의 선택: <strong>{classData.userChoice}</strong></p>
            <p>정답: <strong>{classData.aiPrediction.className}</strong></p>
            <p style={{ marginTop: '20px' }}>
              다음에는 더 잘 분류할 수 있을 거예요! 💪
            </p>
          </div>
        )}

        {fireworks.map((fw) => (
          <div
            key={fw.id}
            className="fireworks"
            style={{
              left: `${fw.left}%`,
              animationDelay: `${fw.delay}s`
            }}
          >
            {['🎉', '✨', '⭐', '🌟'][Math.floor(Math.random() * 4)]}
          </div>
        ))}

        <button
          className="next-button"
          onClick={() => navigate('/camera')}
        >
          다시 도전하기! 🔍
        </button>
      </div>
    </div>
  )
}

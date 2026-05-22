import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { useModel } from '../hooks/useModel'

export default function Classify({ image, setClassification }) {
  const navigate = useNavigate()
  const { classify, WASTE_CLASSES, loading } = useModel()
  const [selectedClass, setSelectedClass] = useState(null)
  const [aiPrediction, setAiPrediction] = useState(null)
  const [classifying, setClassifying] = useState(false)

  useEffect(() => {
    if (!image) {
      navigate('/camera')
      return
    }

    // 모델 로드 완료 후 AI 분류 실행
    if (!loading) {
      runClassification()
    }
  }, [image, navigate, loading])

  const runClassification = async () => {
    try {
      setClassifying(true)
      const result = await classify(image.src)
      setAiPrediction(result)
    } catch (err) {
      console.error('분류 실패:', err)
    } finally {
      setClassifying(false)
    }
  }

  const handleSubmit = () => {
    if (!selectedClass) {
      alert('분류를 선택해주세요!')
      return
    }

    if (!aiPrediction) {
      alert('AI 분류가 완료되지 않았습니다. 잠시만 기다려주세요.')
      return
    }

    const classificationData = {
      userChoice: selectedClass,
      aiPrediction: aiPrediction,
      correct: selectedClass === aiPrediction.classId
    }

    // location.state로 데이터를 전달하며 navigate
    navigate('/success', { state: classificationData })
  }

  if (!image) {
    return null
  }

  return (
    <div className="container">
      <NavBar />
      <div className="classify">
        <img src={image.src} alt="선택한 이미지" className="preview-image" />

        <div className="question">
          이 친구는 어디로 가야 할까요? 🤔
        </div>

        {classifying ? (
          <div className="loading">
            <div className="spinner"></div>
            <div className="spinner"></div>
            <div className="spinner"></div>
          </div>
        ) : null}

        {aiPrediction && (
          <div className="ai-result">
            🤖 AI의 예측: <strong>{aiPrediction.className}</strong>
            <br />
            신뢰도: {aiPrediction.confidence}%
          </div>
        )}

        <div className="classification-buttons">
          {WASTE_CLASSES.map((wasteClass) => (
            <button
              key={wasteClass.id}
              className={`waste-button ${wasteClass.color} ${
                selectedClass === wasteClass.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedClass(wasteClass.id)}
            >
              <div className="emoji">{wasteClass.emoji}</div>
              <div className="label">{wasteClass.name}</div>
            </button>
          ))}
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          다음으로 진행하기 ➡️
        </button>
      </div>
    </div>
  )
}

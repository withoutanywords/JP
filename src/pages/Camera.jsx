import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function Camera({ setImage }) {
  const navigate = useNavigate()
  const cameraInputRef = useRef(null)
  const albumInputRef = useRef(null)

  const handleImageCapture = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage({
          src: event.target.result,
          file: file
        })
        navigate('/classify')
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container">
      <NavBar />
      <div className="camera">
        <div className="camera-illustration">📷</div>
        <h2>사진을 선택해주세요!</h2>
        <p>쓰레기 사진을 찍거나<br/>앨범에서 선택하세요</p>

        <div className="camera-buttons">
          <button
            className="camera-btn"
            onClick={() => cameraInputRef.current?.click()}
          >
            📸 찰칵! 사진 찍기
          </button>
          <button
            className="camera-btn"
            onClick={() => albumInputRef.current?.click()}
          >
            🖼️ 앨범에서 가져오기
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageCapture}
        />
        <input
          ref={albumInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageCapture}
        />
      </div>
    </div>
  )
}

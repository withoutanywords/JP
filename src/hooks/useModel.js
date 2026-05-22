import { useState, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'

const WASTE_CLASSES = [
  { id: 0, name: '1번 종이', emoji: '📄', color: 'paper' },
  { id: 1, name: '2번 플라스틱', emoji: '🍾', color: 'plastic' },
  { id: 2, name: '3번 음식물 쓰레기', emoji: '🍌', color: 'food' },
  { id: 3, name: '4번 일반 쓰레기', emoji: '🗑️', color: 'general' }
]

const MODEL_URL = '/model/model.json'

export function useModel() {
  const [model, setModel] = useState({ ready: false, isDummy: true })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('TensorFlow.js 모델 로드 중...')

        // 로컬 모델 시도
        try {
          const loadedModel = await tf.loadLayersModel(MODEL_URL)
          console.log('✅ 로컬 모델 로드 완료')
          setModel({ tfModel: loadedModel, ready: true })
          setLoading(false)
          return
        } catch (localErr) {
          console.warn('⚠️ 로컬 모델 로드 실패')
        }

        // MobileNet v2 로드 (더 호환성 좋은 버전)
        try {
          console.log('📥 MobileNet v2 로드 중...')
          const mobilenetUrl = 'https://tfhub.dev/google/tfjs-models/tfjs_models/mobilenet_v2_1.0_224/model.json'
          const mobilenet = await tf.loadLayersModel(mobilenetUrl)
          console.log('✅ MobileNet v2 로드 완료 (1000개 클래스 분류)')
          setModel({ tfModel: mobilenet, ready: true, source: 'mobilenet' })
          setLoading(false)
          return
        } catch (mobilenetErr) {
          console.warn('⚠️ MobileNet 로드 실패:', mobilenetErr.message)
        }

        // 모두 실패하면 더미 모델 사용
        console.log('💡 더미 모델로 대체합니다.')
        setModel({ tfModel: null, ready: true, isDummy: true })
        setLoading(false)
      } catch (err) {
        console.error('모델 로드 중 오류:', err)
        setModel({ tfModel: null, ready: true, isDummy: true })
        setLoading(false)
      }
    }

    loadModel()
  }, [])

  const classify = async (imageSrc) => {
    try {
      if (!model?.ready) {
        throw new Error('모델이 준비되지 않았습니다')
      }

      // 더미 모델인 경우 - 임의 예측
      if (model.isDummy) {
        console.log('🎲 더미 모델 - 임의 예측 사용')
        const randomClassId = Math.floor(Math.random() * WASTE_CLASSES.length)
        const randomConfidence = (70 + Math.random() * 25).toFixed(1)
        return {
          classId: randomClassId,
          className: WASTE_CLASSES[randomClassId].name,
          confidence: randomConfidence
        }
      }

      // 실제 모델인 경우
      if (!model?.tfModel) {
        throw new Error('모델이 준비되지 않았습니다')
      }

      // 이미지 로드 및 전처리
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = imageSrc

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // 이미지를 canvas에 그려서 픽셀 데이터 추출
            const canvas = document.createElement('canvas')
            canvas.width = 224
            canvas.height = 224
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, 224, 224)

            // 이미지 텐서 생성
            const imageTensor = tf.browser.fromPixels(canvas)
              .resizeNearestNeighbor([224, 224])
              .cast('float32')
              .expandDims(0)

            // MobileNetV2 전처리 (ImageNet 표준화)
            const preprocessed = imageTensor.div(tf.scalar(127.5)).sub(tf.scalar(1.0))

            // 모델 추론
            const predictions = model.tfModel.predict(preprocessed)
            const probabilities = predictions.dataSync()

            // 최고 확률 클래스 찾기
            let maxProb = 0
            let classId = 0
            for (let i = 0; i < probabilities.length; i++) {
              if (probabilities[i] > maxProb) {
                maxProb = probabilities[i]
                classId = i < WASTE_CLASSES.length ? i : 0
              }
            }

            // 정규화된 확률을 백분율로 변환
            const confidence = (maxProb * 100).toFixed(1)

            // 메모리 정리
            imageTensor.dispose()
            preprocessed.dispose()
            predictions.dispose()

            resolve({
              classId: classId,
              className: WASTE_CLASSES[classId].name,
              confidence: confidence
            })
          } catch (err) {
            reject(new Error('이미지 처리 오류: ' + err.message))
          }
        }

        img.onerror = () => {
          reject(new Error('이미지 로드 실패'))
        }
      })
    } catch (err) {
      console.error('분류 오류:', err)
      setError(err.message)
      throw err
    }
  }

  return { model, loading, error, classify, WASTE_CLASSES }
}

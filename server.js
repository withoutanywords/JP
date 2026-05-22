import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

const WASTE_CLASSES = [
  { id: 0, name: '종이', emoji: '📄' },
  { id: 1, name: '플라스틱', emoji: '🍾' },
  { id: 2, name: '음식물 쓰레기', emoji: '🍌' },
  { id: 3, name: '일반 쓰레기', emoji: '🗑️' }
]

app.post('/api/classify', async (req, res) => {
  try {
    const { imageBase64 } = req.body

    if (!imageBase64) {
      return res.status(400).json({ error: '이미지가 필요합니다' })
    }

    // base64 데이터에서 data URL 프리픽스 제거
    const base64Data = imageBase64.split(',')[1] || imageBase64

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data
              }
            },
            {
              type: 'text',
              text: `이 사진의 물건을 다음 4가지 중 하나로 분류해주세요:
1. 종이 (신문지, 상자, 종이팩 등)
2. 플라스틱 (플라스틱병, 플라스틱 용기 등)
3. 음식물 쓰레기 (과일껍질, 음식 찌꺼기 등)
4. 일반 쓰레기 (기타 버릴 물건)

응답은 JSON 형식으로 다음과 같이 해주세요:
{"classification": "1", "confidence": "95", "reason": "종이상자입니다"}

숫자만 사용하고, 다른 설명은 하지 마세요.`
            }
          ]
        }
      ]
    })

    // Claude의 응답 파싱
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    let classification
    try {
      classification = JSON.parse(responseText)
    } catch (e) {
      // JSON 파싱 실패 시 정규식으로 추출 시도
      const match = responseText.match(/"classification":\s*"(\d)"/)
      const classId = match ? parseInt(match[1]) - 1 : 0
      classification = {
        classification: String(classId),
        confidence: '80',
        reason: responseText
      }
    }

    const classId = parseInt(classification.classification)
    const wasteClass = WASTE_CLASSES[classId] || WASTE_CLASSES[0]

    res.json({
      classId: classId,
      className: wasteClass.name,
      confidence: classification.confidence,
      emoji: wasteClass.emoji
    })
  } catch (error) {
    console.error('분류 실패:', error)
    res.status(500).json({
      error: '분류 실패',
      message: error.message
    })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 API 서버 시작: http://localhost:${PORT}`)
})

#!/usr/bin/env node
/**
 * 測試遊戲房間 API：建立房間 → 取得房間 → 加入房間 → 再取得房間
 * 需先啟動 dev：npm run dev
 * 執行：npm run test:games-room  或  node scripts/test-games-room.mjs [baseUrl]
 */
const baseUrl = process.argv[2] || 'http://localhost:3000'

async function run() {
  console.log('Testing games room API at', baseUrl)
  try {
    const createRes = await fetch(`${baseUrl}/api/games/rooms`, { method: 'POST' })
    const createData = await createRes.json()
    if (!createRes.ok) {
      console.error('POST /api/games/rooms failed:', createData)
      process.exit(1)
    }
    const slug = createData.slug
    console.log('1. Create room OK:', { slug, inviteUrl: createData.inviteUrl })

    const getRes = await fetch(`${baseUrl}/api/games/rooms/${slug}`)
    const getData = await getRes.json()
    if (!getRes.ok) {
      console.error('GET room failed:', getData)
      process.exit(1)
    }
    console.log('2. Get room OK:', { players: getData.players?.length ?? 0 })

    const joinRes = await fetch(`${baseUrl}/api/games/rooms/${slug}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'TestUser' }),
    })
    const joinData = await joinRes.json()
    if (!joinRes.ok) {
      console.error('POST join failed:', joinData)
      process.exit(1)
    }
    console.log('3. Join room OK:', { players: joinData.players?.length ?? 0 })

    const getRes2 = await fetch(`${baseUrl}/api/games/rooms/${slug}`)
    const getData2 = await getRes2.json()
    if (!getRes2.ok) {
      console.error('GET room again failed:', getData2)
      process.exit(1)
    }
    console.log('4. Get room again OK:', { players: getData2.players?.length ?? 0 })
    console.log('All tests passed.')
  } catch (e) {
    console.error('Request failed:', e.message)
    process.exit(1)
  }
}

run()

'use client'

import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  hue: number
  twinkleSpeed: number
}

interface InteractiveParticleBackgroundProps {
  /** 粒子數量 */
  particleCount?: number
  /** 背景類型 */
  type?: 'stars' | 'aurora' | 'galaxy' | 'nebula'
  /** 互動敏感度 (0-1) */
  sensitivity?: number
  /** 是否啟用滑鼠互動 */
  mouseInteractive?: boolean
  /** 是否啟用滾動視差 */
  parallax?: boolean
  /** 粒子大小範圍 */
  sizeRange?: [number, number]
  /** 連線距離閾值 */
  connectionDistance?: number
  /** 類名 */
  className?: string
}

/**
 * E1. 動態背景粒子系統 - 互動式星空效果
 * 創建可互動的粒子背景，支援多種視覺效果
 */
export function InteractiveParticleBackground({
  particleCount = 150,
  type = 'stars',
  sensitivity = 0.7,
  mouseInteractive = true,
  parallax = true,
  sizeRange = [1, 3],
  connectionDistance = 100,
  className = ''
}: InteractiveParticleBackgroundProps) {
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>(0)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // 根據類型設定粒子屬性
  const getTypeConfig = () => {
    switch (type) {
      case 'aurora':
        return {
          baseHue: 180,
          hueRange: 60,
          baseSize: [2, 5],
          opacityRange: [0.3, 0.8],
          speedRange: [0.1, 0.5]
        }
      case 'galaxy':
        return {
          baseHue: 280,
          hueRange: 80,
          baseSize: [1, 4],
          opacityRange: [0.2, 0.9],
          speedRange: [0.2, 1.0]
        }
      case 'nebula':
        return {
          baseHue: 300,
          hueRange: 100,
          baseSize: [3, 8],
          opacityRange: [0.1, 0.6],
          speedRange: [0.05, 0.3]
        }
      case 'stars':
      default:
        return {
          baseHue: 200,
          hueRange: 40,
          baseSize: sizeRange,
          opacityRange: [0.4, 0.9],
          speedRange: [0.1, 0.8]
        }
    }
  }

  // 初始化粒子
  const initializeParticles = () => {
    const config = getTypeConfig()
    const particles: Particle[] = []
    
    for (let i = 0; i < particleCount; i++) {
      const hue = config.baseHue + (Math.random() - 0.5) * config.hueRange
      const size = config.baseSize[0] + Math.random() * (config.baseSize[1] - config.baseSize[0])
      const opacity = config.opacityRange[0] + Math.random() * (config.opacityRange[1] - config.opacityRange[0])
      const speed = config.speedRange[0] + Math.random() * (config.speedRange[1] - config.speedRange[0])
      
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size,
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed,
        opacity,
        hue: hue,
        twinkleSpeed: 0.01 + Math.random() * 0.03
      })
    }
    
    particlesRef.current = particles
  }

  // 更新粒子位置
  const updateParticles = () => {
    if (reducedMotion) return
    
    const particles = particlesRef.current
    const mousePos = mousePositionRef.current
    
    particles.forEach(particle => {
      // 基本移動
      particle.x += particle.speedX
      particle.y += particle.speedY
      
      // 邊界處理
      if (particle.x < 0 || particle.x > dimensions.width) {
        particle.speedX *= -1
      }
      if (particle.y < 0 || particle.y > dimensions.height) {
        particle.speedY *= -1
      }
      
      // 保持在畫布內
      particle.x = Math.max(0, Math.min(dimensions.width, particle.x))
      particle.y = Math.max(0, Math.min(dimensions.height, particle.y))
      
      // 滑鼠互動
      if (mouseInteractive && sensitivity > 0) {
        const dx = particle.x - mousePos.x
        const dy = particle.y - mousePos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 150) {
          const force = (150 - distance) / 150 * sensitivity
          particle.x += dx * force * 0.02
          particle.y += dy * force * 0.02
        }
      }
      
      // 閃爍效果
      particle.opacity = Math.max(0.1, Math.min(1, 
        particle.opacity + (Math.sin(Date.now() * particle.twinkleSpeed) * 0.02)
      ))
    })
  }

  // 繪製粒子和連線
  const drawParticles = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 清除畫布
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    
    const particles = particlesRef.current
    
    // 繪製粒子
    particles.forEach(particle => {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`
      ctx.fill()
      
      // 添加光暈效果
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      )
      gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, ${particle.opacity * 0.8})`)
      gradient.addColorStop(1, `hsla(${particle.hue}, 60%, 50%, 0)`)
      
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    })
    
    // 繪製粒子間連線
    if (connectionDistance > 0) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.3
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }
  }

  // 動畫循環
  const animate = () => {
    if (reducedMotion) {
      drawParticles()
      return
    }
    
    updateParticles()
    drawParticles()
    animationRef.current = requestAnimationFrame(animate)
  }

  // 處理滑鼠移動
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mouseInteractive) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  // 處理視窗大小變化
  const handleResize = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    setDimensions({
      width: rect.width,
      height: rect.height
    })
  }

  // 初始化和清理
  useEffect(() => {
    handleResize()
    initializeParticles()
    animate()
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleCount, type, dimensions.width, dimensions.height, reducedMotion])

  // 當類型或數量改變時重新初始化
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initializeParticles()
    }
  }, [particleCount, type, dimensions.width, dimensions.height])

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        className="w-full h-full"
        style={{ 
          opacity: reducedMotion ? 0.3 : 1,
          transition: 'opacity 0.5s ease'
        }}
        aria-hidden="true"
      />
      
      {/* 性能提示 */}
      {reducedMotion && (
        <div className="absolute top-4 right-4 text-xs text-white/30 bg-black/50 px-2 py-1 rounded">
          動畫已簡化以提升效能
        </div>
      )}
    </div>
  )
}

// 預設導出
export default InteractiveParticleBackground
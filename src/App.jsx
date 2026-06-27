import { useEffect, useMemo, useState, useRef } from 'react'
import './App.css'

/* ── Config ── */
const FULL_NAME = 'Tushar Ranjan Pandey'
const PHONE = '+91-8447819778'
const EMAIL = 'pandeytushar359@gmail.com'
const LINKEDIN_URL = 'https://www.linkedin.com/in/tushar-ranjan-pandey'
const GITHUB_USERNAME = 'Tushar-Pandey-31'
const GITHUB_SEC_USERNAME = 'tuxsharxsec'
const CHESS_USERNAME = 'tuxsharx'
const X_HANDLE = '@tuxsharx'
const CRITIKAL_URL = 'https://critikalai.com'
const FINNACLE_LIVE_URL = 'https://finnacle-beta.vercel.app/'

/* ── Hooks ── */
function useChessRatings(username) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ok = true
    async function run() {
      try {
        setLoading(true)
        const res = await fetch(`https://api.chess.com/pub/player/${username}/stats`)
        if (!res.ok) throw new Error('fail')
        const json = await res.json()
        if (ok) setData(json)
      } catch { /* silent */ }
      finally { if (ok) setLoading(false) }
    }
    run()
    return () => { ok = false }
  }, [username])

  return { data, loading }
}

function useInView() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.unobserve(el)
      }
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, visible]
}

/* ── Particle Background ── */
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    let w, h

    function resize() {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    function createParticles() {
      particles = []
      const count = Math.floor((w * h) / 18000)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.02)'
      ctx.lineWidth = 0.5
      const gridSize = 60
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`
        ctx.fill()
      }

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    createParticles()
    draw()

    window.addEventListener('resize', () => { resize(); createParticles() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="bg-canvas" />
}

/* ── Fade-In Wrapper ── */
function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView()
  return (
    <div
      ref={ref}
      className={`fade-in ${visible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ── Main App ── */
function App() {
  const { data: chess, loading: chessLoading } = useChessRatings(CHESS_USERNAME)

  const chessRatings = useMemo(() => {
    if (!chess) return null
    return {
      rapid: chess.chess_rapid?.last?.rating,
      blitz: chess.chess_blitz?.last?.rating,
      bullet: chess.chess_bullet?.last?.rating,
    }
  }, [chess])

  const projects = [
    {
      id: 'critikal',
      title: 'Critikal',
      subtitle: 'CritikalAI',
      desc: 'Autonomous smart contract security agent. Multi-agent pipeline with knowledge graphs, adversarial jury validation, and Foundry PoC generation. Finds what scanners miss — and proves it.',
      url: CRITIKAL_URL,
      github: `https://github.com/${GITHUB_USERNAME}/Critikal`,
      icon: '🛡️',
      tags: [
        { label: 'Python', cls: 'lang-python' },
        { label: 'Solidity', cls: 'lang-solidity' },
        { label: 'Security', cls: 'security' },
        { label: 'AI Agents', cls: 'ai' },
      ],
      metrics: [
        { label: 'Stars', value: '13' },
        { label: 'Contracts', value: '143' },
        { label: 'Exploits', value: '20' },
      ],
      layout: 'featured',
    },
    {
      id: 'critikal-site',
      title: 'critikalai.com',
      desc: 'Product site for Critikal — request access, benchmark results, and pipeline visualization.',
      url: CRITIKAL_URL,
      icon: '🌐',
      tags: [
        { label: 'Product', cls: 'ai' },
        { label: 'SaaS', cls: 'ai' },
      ],
      layout: 'side',
    },
    {
      id: 'rico',
      title: 'RICO',
      subtitle: 'AI Pentester',
      desc: 'Adversarial Discord agent for LLM guardrail red-teaming — tests prompt injection, jailbreak resistance, and tool misuse in a controlled research environment.',
      github: 'https://github.com/wfsva-alt/RICO',
      icon: '🤖',
      tags: [
        { label: 'Python', cls: 'lang-python' },
        { label: 'AI', cls: 'ai' },
        { label: 'Security', cls: 'security' },
      ],
      layout: 'side',
    },
    {
      id: 'ai-security-lab',
      title: 'AI Security Lab',
      desc: 'Educational lab documenting AI jailbreak attempts, adversarial inputs, and CTFs — aimed at improving model robustness and security awareness.',
      github: `https://github.com/${GITHUB_USERNAME}/ai-security-lab`,
      icon: '🔓',
      tags: [
        { label: 'AI Security', cls: 'security' },
        { label: 'Jailbreaks', cls: 'security' },
        { label: 'Adversarial AI', cls: 'ai' },
      ],
      layout: 'wide',
    },
    {
      id: 'nemo-guardrails-bypass',
      title: 'NeMo Guardrails Bypass',
      desc: 'Multi-turn social engineering attack that bypassed NVIDIA NeMo Guardrails (input + output layers) in 3 conversational turns. Full methodology writeup with PoC screenshots.',
      github: 'https://github.com/tuxsharxsec/Jailbreaks/blob/main/research/nvdia-nemo-guardrails-bypass/writeup.md',
      icon: '🧠',
      tags: [
        { label: 'AI Red Team', cls: 'security' },
        { label: 'Guardrails', cls: 'security' },
        { label: 'Research', cls: 'ai' },
      ],
      layout: 'wide',
    },
    {
      id: 'jailbreaks',
      title: 'Jailbreaks Collection',
      desc: 'Curated adversarial prompt research — jailbreaks, guardrail bypasses, and CTF writeups for GPT, Claude, Gemini, Grok, and DeepSeek. Used by the AI security community.',
      github: `https://github.com/${GITHUB_SEC_USERNAME}/Jailbreaks`,
      icon: '💀',
      tags: [
        { label: 'Prompt Exploits', cls: 'security' },
        { label: 'AI Red Team', cls: 'security' },
      ],
      metrics: [
        { label: 'Stars', value: '49' },
        { label: 'Forks', value: '5' },
      ],
      layout: 'wide',
    },
    {
      id: 'finnacle',
      title: 'Finnacle',
      desc: 'Free virtual trading platform with equity, derivatives, forex, crypto, and commodities. Full-stack with AI microservice.',
      url: FINNACLE_LIVE_URL,
      github: `https://github.com/${GITHUB_USERNAME}/finnacle`,
      icon: '📈',
      tags: [
        { label: 'JavaScript', cls: 'lang-js' },
        { label: 'Full Stack', cls: 'lang-js' },
        { label: 'FinTech', cls: 'ai' },
      ],
      metrics: [
        { label: 'Status', value: 'Live' },
      ],
      layout: 'featured',
    },
    {
      id: 'system-prompts',
      title: 'System Prompts',
      desc: 'Exploring and sharing system prompts for LLMs, Copilot, and beyond. Research into how AI systems are configured.',
      github: `https://github.com/${GITHUB_SEC_USERNAME}/system_prompts`,
      icon: '⚙️',
      tags: [
        { label: 'LLM Research', cls: 'ai' },
        { label: 'Prompt Engineering', cls: 'ai' },
      ],
      layout: 'side',
    },
  ]

  const skills = {
    'AI & ML': ['Python', 'OpenAI API', 'Claude API', 'LangChain', 'RAG', 'Multi-Agent Systems', 'Prompt Engineering'],
    'Security': ['Smart Contract Auditing', 'AI Red Teaming', 'Jailbreak Research', 'Penetration Testing', 'Slither', 'Foundry'],
    'Backend': ['Spring Boot', 'Java', 'Express.js', 'Node.js', 'Redis'],
    'Frontend & DB': ['React', 'Next.js', 'TypeScript', 'MySQL', 'MongoDB', 'PostgreSQL'],
    'DevOps & Tools': ['Git', 'Docker', 'CI/CD', 'AWS', 'Vercel'],
  }

  return (
    <div className="app">
      <ParticleCanvas />
      <div className="bg-overlay" />
      <div className="scanlines" />

      {/* Nav */}
      <nav>
        <div className="container nav-inner">
          <div className="brand">
            tuxsharx<span className="cursor-blink">_</span>
          </div>
          <div className="nav-links">
            <a className="nav-link" href="#projects">Work</a>
            <a className="nav-link" href="#about">About</a>
            <a className="nav-link primary" href="#contact">Hire Me</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-dot" />
              Available for freelance
            </div>

            <h1 className="hero-title">
              <span className="line">I build</span>
              <span className="line">
                <span className="glitch gradient-text" data-text="intelligent">intelligent</span>
              </span>
              <span className="line">systems.</span>
            </h1>

            <p className="hero-subtitle">
              <strong>AI Engineer & Security Researcher.</strong> I build chatbots, autonomous agents, and AI-powered products — then break them to make them stronger. Creator of <strong>Critikal</strong>.
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">20+</span>
                <span className="stat-label">Proven Exploits</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">143</span>
                <span className="stat-label">Contracts Analyzed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">5+</span>
                <span className="stat-label">AI Agents Built</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">49⭐</span>
                <span className="stat-label">Jailbreaks Repo</span>
              </div>
            </div>

            <div className="hero-cta">
              <a className="btn btn-primary" href="#contact">
                Let's Work Together →
              </a>
              <a className="btn btn-outline-cyan" href={CRITIKAL_URL} target="_blank" rel="noreferrer">
                View Critikal ↗
              </a>
              <a className="btn btn-ghost" href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="btn btn-ghost" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Projects */}
      <section id="projects">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">Selected Work</div>
              <h2 className="section-title">Things I've Built & Broken</h2>
              <p className="section-desc">AI agents, security tools, and full-stack products. Each one taught me something the hard way.</p>
            </div>
          </FadeIn>

          <div className="projects-grid">
            {projects.map((p, i) => (
              <FadeIn key={p.id} delay={i * 80}>
                <a
                  href={p.url || p.github}
                  target="_blank"
                  rel="noreferrer"
                  className={`project-card ${p.layout}`}
                >
                  <div className="card-header">
                    <span className="card-arrow">↗</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="card-tags">
                    {p.tags.map(t => (
                      <span key={t.label} className={`tag ${t.cls}`}>{t.label}</span>
                    ))}
                  </div>
                  {p.metrics && (
                    <div className="card-metrics">
                      {p.metrics.map(m => (
                        <span key={m.label} className="metric">
                          {m.label}: <span className="value">{m.value}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* About */}
      <section id="about">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">About</div>
              <h2 className="section-title">Builder. Breaker. Learner.</h2>
            </div>
          </FadeIn>

          <div className="about-grid">
            <FadeIn delay={100}>
              <div className="about-text">
                <p>
                  I'm Tushar — an <strong>AI engineer and security researcher</strong> based in Delhi. I build intelligent agents, chatbots, and AI-powered products, and I break smart contracts and AI systems to make them safer.
                </p>
                <br />
                <p>
                  I created <strong>Critikal</strong>, an autonomous smart contract security agent that earned recognition from <strong>Pashov</strong> (one of the top smart contract auditors in the world). My <strong>jailbreaks collection</strong> has 49+ stars and is used as a research resource by the AI security community. Most recently, I documented a multi-turn bypass of NVIDIA NeMo Guardrails — extracting a protected secret in 3 conversational turns with zero adversarial surface.
                </p>
                <br />
                <p>
                  When I'm not building or breaking things, you'll find me playing chess (1820 rapid on Chess.com), reading about derivatives, or learning Spanish. I speak Hindi and English fluently.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="about-highlights">
                <div className="highlight-card">
                  <div className="highlight-icon"></div>
                  <div className="highlight-content">
                    <h4>AI Agent Development</h4>
                    <p>Custom chatbots, RAG pipelines, tool-calling agents, and multi-agent orchestration systems.</p>
                  </div>
                </div>
                <div className="highlight-card">
                  <div className="highlight-icon"></div>
                  <div className="highlight-content">
                    <h4>Security Research</h4>
                    <p>Smart contract auditing, AI red teaming, prompt injection testing, and adversarial robustness.</p>
                  </div>
                </div>
                <div className="highlight-card">
                  <div className="highlight-icon"></div>
                  <div className="highlight-content">
                    <h4>Full-Stack Products</h4>
                    <p>End-to-end product development from database design to deployment. Ship fast, ship right.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Skills */}
      <section id="skills">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">Tech Stack</div>
              <h2 className="section-title">Tools of the Trade</h2>
            </div>
          </FadeIn>

          <div className="skills-grid">
            {Object.entries(skills).map(([category, items], i) => (
              <FadeIn key={category} delay={i * 80}>
                <div className="skill-card">
                  <h4>{category}</h4>
                  <div className="skill-items">
                    {items.map(s => (
                      <span key={s} className="skill-item">{s}</span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Chess */}
      <section id="chess" className="chess-section">
        <div className="container">
          <FadeIn>
            <div className="section-header">
              <div className="section-label">Off the Clock</div>
              <h2 className="section-title">Chess Ratings</h2>
              <p className="section-desc">Live from Chess.com. I think chess taught me more about debugging than any course.</p>
            </div>
          </FadeIn>

          <div className="chess-grid">
            {chessLoading ? (
              <div className="chess-card" style={{ gridColumn: 'span 3' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading live ratings...</p>
              </div>
            ) : (
              <>
                {chessRatings?.rapid && (
                  <FadeIn delay={0}>
                    <div className="chess-card">
                      <div className="chess-type">Rapid</div>
                      <div className="chess-rating">{chessRatings.rapid}</div>
                    </div>
                  </FadeIn>
                )}
                {chessRatings?.blitz && (
                  <FadeIn delay={100}>
                    <div className="chess-card">
                      <div className="chess-type">Blitz</div>
                      <div className="chess-rating">{chessRatings.blitz}</div>
                    </div>
                  </FadeIn>
                )}
                {chessRatings?.bullet && (
                  <FadeIn delay={200}>
                    <div className="chess-card">
                      <div className="chess-type">Bullet</div>
                      <div className="chess-rating">{chessRatings.bullet}</div>
                    </div>
                  </FadeIn>
                )}
              </>
            )}
          </div>

          <FadeIn delay={300}>
            <div style={{ marginTop: '24px' }}>
              <a
                className="btn btn-ghost"
                href={`https://www.chess.com/member/${CHESS_USERNAME}`}
                target="_blank"
                rel="noreferrer"
              >
                ♟ View Full Profile on Chess.com ↗
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Contact */}
      <section id="contact" className="contact-section">
        <div className="container">
          <FadeIn>
            <div className="section-label" style={{ justifyContent: 'center' }}>Get in Touch</div>
            <h2 className="contact-title">
              Let's build something<br />
              <span style={{
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple), var(--accent-pink))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                incredible.
              </span>
            </h2>
            <p className="contact-desc">
              Need an AI chatbot? An AI agent? A security audit? Or just want to talk chess? I'm one message away.
            </p>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="contact-links">
              <a className="btn btn-primary" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
              <a className="btn btn-outline-cyan" href={`tel:${PHONE.replace(/[^\d+]/g, '')}`}>
                {PHONE}
              </a>
              <a className="btn btn-ghost" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                LinkedIn ↗
              </a>
              <a className="btn btn-ghost" href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <a className="btn btn-ghost" href={`https://x.com/${X_HANDLE.replace('@', '')}`} target="_blank" rel="noreferrer">
                X (Twitter) ↗
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          {'©'} {new Date().getFullYear()} {FULL_NAME} {'·'} Built with React + Vite {'·'}{' '}
          <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">Source</a>
        </div>
      </footer>
    </div>
  )
}

export default App

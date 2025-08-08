import { useEffect, useMemo, useState } from 'react'
import './App.css'

const FULL_NAME = 'Tushar Ranjan Pandey'
const PHONE = '+91-8447819778'
const EMAIL = 'pandeytushar359@gmail.com'
const LINKEDIN_URL = 'https://www.linkedin.com/in/tushar-pandey-49aa5a215/'

const GITHUB_USERNAME = 'Tushar-Pandey-31'
const CHESS_USERNAME = 'tuxsharx'
const PIN_KEYWORDS = ['finnacle', 'finacle', 'microservice', 'microservices', 'eda', 'event']
const PINNED_REPO_NAMES = ['finnacle', 'finacle']
const MANUAL_PINNED_FULLNAMES = ['Tushar-Pandey-31/finnacle', 'Tushar-Pandey-31/finacle']
const FINNACLE_LIVE_URL = 'https://finnacle-beta.vercel.app/'

function useGithubProfile(username) {
  const [data, setData] = useState(null)
  const [repos, setRepos] = useState([])
  const [extraRepos, setExtraRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    async function run() {
      try {
        setLoading(true)
        const [profileRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
        ])
        if (!profileRes.ok) throw new Error('GitHub profile fetch failed')
        if (!reposRes.ok) throw new Error('GitHub repos fetch failed')
        const profile = await profileRes.json()
        const reposJson = await reposRes.json()

        // Fetch any manual pinned repos not already included
        const have = new Set(reposJson.map(r => (r.full_name || '').toLowerCase()))
        const missing = MANUAL_PINNED_FULLNAMES.filter(f => !have.has(f.toLowerCase()))
        let fetchedExtras = []
        if (missing.length) {
          const extraRes = await Promise.all(
            missing.map(full => fetch(`https://api.github.com/repos/${full}`))
          )
          const ok = await Promise.all(
            extraRes.map(async r => (r.ok ? r.json() : null))
          )
          fetchedExtras = ok.filter(Boolean)
        }

        if (!isMounted) return
        setData(profile)
        setRepos(reposJson)
        setExtraRepos(fetchedExtras)
      } catch (e) {
        if (!isMounted) return
        setError(String(e.message || e))
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => { isMounted = false }
  }, [username])

  const { topRepos, curatedProjects } = useMemo(() => {
    const all = [...(repos || []), ...(extraRepos || [])].filter(r => !r.fork)
    const byStars = [...all].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))

    const isFinnacle = (r) => ((r.name || '').toLowerCase().includes('finnacle') || (r.name || '').toLowerCase().includes('finacle'))
    const pinnedByName = all.filter(r => PINNED_REPO_NAMES.some(n => (r.name || '').toLowerCase().includes(n)))

    const microKeyword = (r) => {
      const name = (r.name || '').toLowerCase()
      const desc = (r.description || '').toLowerCase()
      const topics = (r.topics || []).join(' ').toLowerCase()
      const text = name + ' ' + desc + ' ' + topics
      return ['microservice', 'microservices', 'spring', 'cloud', 'eureka', 'kafka', 'event'].some(k => text.includes(k))
    }

    const microRepos = all.filter(microKeyword)

    // Compose only Finnacle (+manual) and microservice repos
    const ordered = []
    const seen = new Set()

    // Manual full-name pins first in their provided order
    for (const fullname of MANUAL_PINNED_FULLNAMES) {
      const item = all.find(r => (r.full_name || '').toLowerCase() === fullname.toLowerCase())
      if (item && !seen.has(item.id)) { seen.add(item.id); ordered.push(item) }
    }

    // Finnacle by name if found
    for (const r of all) { if (isFinnacle(r) && !seen.has(r.id)) { seen.add(r.id); ordered.push(r) } }

    // Microservice repos next, highest stars first
    for (const r of [...microRepos].sort((a,b)=> (b.stargazers_count||0)-(a.stargazers_count||0))) {
      if (!seen.has(r.id)) { seen.add(r.id); ordered.push(r) }
    }

    // If no Finnacle repo found, add a manual entry to represent live app
    if (!ordered.some(r => isFinnacle(r))) {
      ordered.unshift({
        id: 'finnacle-live',
        name: 'Finnacle',
        description: 'Paper Trading App',
        html_url: FINNACLE_LIVE_URL,
        stargazers_count: 0,
        language: '—',
      })
    }

    const curated = ordered
    const top = byStars.slice(0, 6)
    return { topRepos: top, curatedProjects: curated }
  }, [repos, extraRepos])

  return { data, repos: topRepos, projects: curatedProjects, loading, error }
}

function useChessRatings(username) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    async function run() {
      try {
        setLoading(true)
        const res = await fetch(`https://api.chess.com/pub/player/${username}/stats`)
        if (!res.ok) throw new Error('Chess.com fetch failed')
        const json = await res.json()
        if (!isMounted) return
        setData(json)
      } catch (e) {
        if (!isMounted) return
        setError(String(e.message || e))
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    run()
    return () => { isMounted = false }
  }, [username])

  return { data, loading, error }
}

function StatChip({ label, value }) {
  return (
    <div className="badge">
      <span style={{opacity: 0.8}}>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function App() {
  const { data: gh, projects, loading: ghLoading } = useGithubProfile(GITHUB_USERNAME)
  const { data: chess, loading: chessLoading } = useChessRatings(CHESS_USERNAME)

  const chessRatings = useMemo(() => {
    if (!chess) return null
    const blitz = chess.chess_blitz?.last?.rating
    const rapid = chess.chess_rapid?.last?.rating
    const bullet = chess.chess_bullet?.last?.rating
    return { blitz, rapid, bullet }
  }, [chess])

  const skills = {
    languages: ['Java', 'JavaScript', 'HTML/CSS', 'SQL'],
    backend: ['Spring Boot', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch'],
    tools: ['Git', 'Kafka', 'Docker'],
    concepts: ['Microservices', 'REST API', 'JWT Authentication', 'Caching', 'Event-Driven Architecture']
  }

  const specialties = [
    { title: 'Microservices', desc: 'Independent, deployable services with clear contracts and resiliency patterns.' },
    { title: 'Event-Driven Architecture', desc: 'Asynchronous messaging, CQRS, and streaming for responsive systems.' },
    { title: 'Cloud & Containers', desc: 'Docker, orchestration, and CI/CD with strong observability.' },
  ]

  return (
    <div className="app">
      <nav>
        <div className="container nav-inner">
          <div className="brand">{FULL_NAME}</div>
          <div className="cta-row">
            <a className="btn btn-ghost" href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="btn btn-ghost" href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn btn-ghost-chess" href={`https://www.chess.com/member/${CHESS_USERNAME}`} target="_blank" rel="noreferrer">Chess.com</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container hero-grid">
          <div>
            <div className="badge">Backend Developer</div>
            <h1 className="title">I’m a backend developer, chess enthusiast, and finance geek with a love for derivatives. I design scalable systems in Java + Spring Boot where every millisecond counts. Outside of code, I’m always learning — from market strategies to new languages. I speak Hindi, English, and I’m a beginner in Spanish.

</h1>
            <p className="subtitle">Microservices • Spring Boot • Kafka • Redis • Elasticsearch</p>
            {/* <div className="cta-row">
              <a className="btn btn-primary" href={`mailto:${EMAIL}`}>Contact</a>
              <a className="btn btn-ghost" href={`tel:${PHONE.replace(/[^+\d]/g, '')}`}>Call {PHONE}</a>
            </div> */}
          </div>
          <div>
            <div className="sections">
              <div className="card">
                <h3>Chess.com</h3>
                {chessLoading && <p className="subtitle">Loading chess ratings…</p>}
                {!chessLoading && !chessRatings && <p className="subtitle">Unable to load ratings.</p>}
                {!chessLoading && chessRatings && (
                  <div className="cta-row">
                    {chessRatings.rapid && <StatChip label="Rapid" value={chessRatings.rapid} />}
                    {chessRatings.blitz && <StatChip label="Blitz" value={chessRatings.blitz} />}
                    {chessRatings.bullet && <StatChip label="Bullet" value={chessRatings.bullet} />}
                  </div>
                )}
                <p style={{marginTop: 10}}>
                  <a className="btn btn-ghost" href={`https://www.chess.com/member/${CHESS_USERNAME}`} target="_blank" rel="noreferrer">See profile</a>
                </p>
              </div>

              <div className="card">
                <h3>Focus</h3>
                <div className="card-grid">
                  {specialties.map(s => (
                    <div key={s.title} className="card card-4">
                      <h4 style={{margin: 0}}>{s.title}</h4>
                      <p>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="main-content-wrapper">
        <div className="container sections">
          <section className="card text-center">
            <div className="section-title"><span className="kbd">Contact</span></div>
            <div className="cta-row center">
              <a className="btn btn-ghost" href={`mailto:${EMAIL}`}>📧 {EMAIL}</a>
              <a className="btn btn-ghost" href={`tel:${PHONE.replace(/[^+\d]/g, '')}`}>📞 {PHONE}</a>
              <a className="btn btn-ghost" href={LINKEDIN_URL} target="_blank" rel="noreferrer">🔗 LinkedIn</a>
              <a className="btn btn-ghost" href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">💻 GitHub</a>
            </div>
          </section>

          <section className="card text-center">
            <div className="section-title"><span className="kbd">Skills</span></div>
            <div className="card-grid">
              <div className="card card-6">
                <h4 style={{marginTop: 0}}>Programming Languages</h4>
                <div className="cta-row center">{skills.languages.map(s => <span key={s} className="badge">{s}</span>)}</div>
              </div>
              <div className="card card-6">
                <h4 style={{marginTop: 0}}>Backend & Databases</h4>
                <div className="cta-row center">{skills.backend.map(s => <span key={s} className="badge">{s}</span>)}</div>
              </div>
              <div className="card card-6">
                <h4 style={{marginTop: 0}}>Tools & Technology</h4>
                <div className="cta-row center">{skills.tools.map(s => <span key={s} className="badge">{s}</span>)}</div>
              </div>
              <div className="card card-6">
                <h4 style={{marginTop: 0}}>Concepts</h4>
                <div className="cta-row center">{skills.concepts.map(s => <span key={s} className="badge">{s}</span>)}</div>
              </div>
            </div>
          </section>

          <section className="card text-center prose">
            <div className="section-title"><span className="kbd">Experience</span></div>
            <h4 style={{margin: '0 0 6px'}}>Junior Software Developer — TravelXP</h4>
            <p className="subtitle">Jun 2023 – Aug 2023</p>
            <ul>
              <li>Developed responsive frontend pages for the Android mobile app using React Native, improving UI consistency and user engagement.</li>
              <li>Collaborated with backend teams to integrate RESTful APIs for seamless data flow between frontend and microservices.</li>
            </ul>
          </section>

          <section className="card">
            <div className="section-title"><span className="kbd">Projects</span></div>
            <div className="card-grid">
              {(projects || []).map(repo => (
                <div key={repo.id} className="card card-12">
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    <h4 style={{marginTop: 0}}>{repo.name}</h4>
                  </a>
                  <p>{repo.description || 'No description provided.'}</p>
                  <div className="cta-row" style={{marginTop: 12}}>
                    <span className="badge">★ {repo.stargazers_count}</span>
                    <span className="badge">{repo.language || '—'}</span>
                  </div>
                  {((repo.name || '').toLowerCase().includes('finnacle') || repo.id === 'finnacle-live') && (
                    <p style={{marginTop: 10}}>
                      <a className="btn btn-primary" href={FINNACLE_LIVE_URL} target="_blank" rel="noreferrer">Go to the live</a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="section-title"><span className="kbd">Education</span></div>
            <div className="card-grid">
              <div className="card card-6">
                <h4 style={{marginTop: 0}}>Scaler Academy — Software Development (2025)</h4>
                <p className="subtitle">Modules: DSA, SQL/DBMS, LLD, HLD, Capstone Project (Backend)</p>
              </div>
              <div className="card card-6">
                <h4 style={{marginTop: 0}}>MDU Rohtak — BCA in Computer Science (2023)</h4>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="section-title"><span className="kbd">Certifications</span></div>
            <ul>
              <li>Data Structures & Algorithms (Scaler) | 10/2023 – 04/2024</li>
              <li>Databases & SQL (Scaler) | 05/2024 – 06/2024</li>
              <li>Low-Level Design (Scaler) | 06/2024 – 11/2024</li>
              <li>Backend/Spring Boot (Scaler) | 01/2025 – 03/2025</li>
              <li>Full Stack Web Development (AttainU) | 05/2022 – 05/2023</li>
            </ul>
          </section>
        </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} {FULL_NAME} · Built with React + Vite
        </div>
      </footer>
    </div>
  )
}

export default App

import { useEffect, useMemo, useState } from 'react'
import './App.css'

const GITHUB_USERNAME = 'Tushar-Pandey-31'
const CHESS_USERNAME = 'tuxsharx'
const PIN_KEYWORDS = ['finnacle', 'finacle', 'microservice', 'microservices', 'eda', 'event']
const PINNED_REPO_NAMES = ['finnacle', 'finacle']
const MANUAL_PINNED_FULLNAMES = ['Tushar-Pandey-31/finnacle', 'Tushar-Pandey-31/finacle']

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

    const pinnedByName = all.filter(r => PINNED_REPO_NAMES.some(n => (r.name || '').toLowerCase().includes(n)))

    const pinnedByKeyword = all.filter(r => {
      const name = (r.name || '').toLowerCase()
      const desc = (r.description || '').toLowerCase()
      return PIN_KEYWORDS.some(k => name.includes(k) || desc.includes(k))
    })

    const ordered = []
    const seen = new Set()

    // Manual full-name pins first in their provided order
    for (const fullname of MANUAL_PINNED_FULLNAMES) {
      const item = all.find(r => (r.full_name || '').toLowerCase() === fullname.toLowerCase())
      if (item && !seen.has(item.id)) { seen.add(item.id); ordered.push(item) }
    }

    for (const r of pinnedByName) { if (!seen.has(r.id)) { seen.add(r.id); ordered.push(r) } }
    for (const r of pinnedByKeyword) { if (!seen.has(r.id)) { seen.add(r.id); ordered.push(r) } }
    for (const r of byStars) { if (!seen.has(r.id)) { seen.add(r.id); ordered.push(r) } }

    const curated = ordered.slice(0, 8)
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

  const specialties = [
    { title: 'Microservices', desc: 'Independent, deployable services with clear contracts and resiliency patterns.' },
    { title: 'Event-Driven Architecture', desc: 'Asynchronous messaging, CQRS, and streaming for responsive systems.' },
    { title: 'Cloud & Containers', desc: 'Docker, orchestration, and CI/CD with strong observability.' },
  ]

  return (
    <div className="app">
      <nav>
        <div className="container nav-inner">
          <div className="brand">Tushar Pandey</div>
          <div className="cta-row">
            <a className="btn btn-ghost" href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn btn-ghost" href={`https://www.chess.com/member/${CHESS_USERNAME}`} target="_blank" rel="noreferrer">Chess.com</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container hero-grid">
          <div>
            <div className="badge">Software Developer • Microservices • EDA</div>
            <h1 className="title">Building resilient, event‑driven systems.</h1>
            <p className="subtitle">I design and implement scalable microservices with event-driven patterns, focusing on reliability, performance, and developer experience.</p>
            <div className="cta-row">
              <a className="btn btn-primary" href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">View GitHub</a>
              <a className="btn btn-ghost" href={`mailto:tusharpandey.work@gmail.com`}>Contact</a>
            </div>
          </div>
          <div>
            <div className="sections">
              <div className="card">
                <h3>Chess.com Ratings</h3>
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
        <div className="container sections">
          <section className="card">
            <div className="section-title"><span className="kbd">GitHub</span> Featured Projects</div>
            {ghLoading && <p className="subtitle">Loading repositories…</p>}
            {!ghLoading && (
              <div className="card-grid">
                {(projects || []).map(repo => (
                  <a key={repo.id} className="card card-4" href={repo.html_url} target="_blank" rel="noreferrer">
                    <h4 style={{margin: 0}}>{repo.name}</h4>
                    <p>{repo.description || 'No description provided.'}</p>
                    <div className="cta-row" style={{marginTop: 12}}>
                      <span className="badge">★ {repo.stargazers_count}</span>
                      <span className="badge">{repo.language || '—'}</span>
                      {repo.topics?.slice(0,2).map(t => (
                        <span key={t} className="badge">{t}</span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <div className="section-title"><span className="kbd">About</span> Me</div>
            <p className="subtitle">I am a software developer focused on microservices and event-driven architecture. I enjoy working with streaming, messaging, and cloud-native tooling to ship robust systems.</p>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} Tushar Pandey · Built with React + Vite
        </div>
      </footer>
    </div>
  )
}

export default App

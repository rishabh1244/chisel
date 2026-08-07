import heroImage from '../../assets/hero-construction.png'
import './styles/Hero.css'

function Hero() {
  const scrollToLogin = () => {
    document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <div className="hero__image-wrap">
        <img className="hero__image" src={heroImage} alt="Construction site at sunset" />
        <div className="hero__fade" />

     </div>

      <div className="hero__content">
        <p className="hero__eyebrow">TRACK. MANAGE. DELIVER.</p>
        <h1 className="hero__heading">
          Version control for
          <br />
          <span className="hero__heading--accent">physical infrastructure.</span>
        </h1>
        <p className="hero__description">
          Chisel brings software-like version control to construction. Track
          progress, manage issues, assign work, and maintain a complete
          history of every change on-site.
        </p>

        <div className="hero__cta-row">
          <button className="btn btn--primary btn--lg" onClick={scrollToLogin}>
            <span>📦</span> Get Started for Free
          </button>
          <button className="btn btn--outline-light btn--lg">
            <span>▶</span> See How It Works
          </button>
        </div>

        <ul className="hero__features">
          <li>
            <span className="hero__check">✓</span> Real-time Tracking
          </li>
          <li>
            <span className="hero__check">✓</span> Team Collaboration
          </li>
          <li>
            <span className="hero__check">✓</span> Complete Audit Trail
          </li>
        </ul>
      </div>
    </section>
  )
}

export default Hero

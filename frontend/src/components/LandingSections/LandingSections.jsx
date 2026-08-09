import React from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingSections.css'
import {
  GitCommit,
  Users,
  AlertCircle,
  Shield,
  Brain,
  BadgeCheck,
  Camera,
  ThumbsUp,
  UserCheck,
  Lock,
  ArrowRight,
  Check,
  X
} from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: GitCommit,
      title: 'Chisel work',
      body: 'Workers log completed work as discrete units with photo and video evidence — attributed, timestamped, permanent.'
    },
    {
      icon: Users,
      title: 'Peer Verification',
      body: 'On-site colleagues give lightweight advisory signals. Senior supervisors approve remotely from submitted evidence.'
    },
    {
      icon: AlertCircle,
      title: 'Issue Tracking',
      body: 'Defects and required fixes are logged as trackable issues with a clear chain of responsibility from identification to resolution.'
    },
    {
      icon: Shield,
      title: 'Permanent Record',
      body: 'Verified work becomes an immutable, auditable project history — usable as proof of work for future contracts, audits, or disputes.'
    },
    {
      icon: Brain,
      title: 'AI Anomaly Detection',
      body: 'Computer vision flags suspicious or incomplete submissions for human review — routing attention, not replacing judgment.'
    },
    {
      icon: BadgeCheck,
      title: 'Contractor Credentialing',
      body: 'Build a verified portfolio of completed work across projects, usable in future bids and dispute resolution.'
    }
  ]

  return (
    <section id="features" className="landing-section">
      <div className="landing-section__header">
        <h2 className="landing-section__title">Everything a jobsite needs to be accountable</h2>
        <p className="landing-section__subtitle">Built on the same principles as software version control</p>
      </div>

      <div className="features-grid">
        {features.map((f, i) => {
          const IconComponent = f.icon
          return (
            <div key={i} className="feature-card">
              <div className="feature-card__icon">
                <IconComponent size={24} />
              </div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__body">{f.body}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: Camera,
      title: 'Chiseling work',
      body: 'Snap a photo or video of completed work. Add a description. Submit as a Chisel.'
    },
    {
      number: '02',
      icon: ThumbsUp,
      title: 'Peers verify',
      body: 'On-site colleagues review and signal. Lightweight, advisory — no bureaucracy.'
    },
    {
      number: '03',
      icon: UserCheck,
      title: 'Supervisor approves',
      body: 'Senior reviews the evidence remotely. Approves, flags, or requests more info.'
    },
    {
      number: '04',
      icon: Lock,
      title: 'Locked to history',
      body: 'Verified work is permanently recorded. Attributed, timestamped, tamper-evident.'
    }
  ]

  return (
    <section id="how-it-works" className="landing-section landing-section--alt">
      <div className="landing-section__inner">
        <div className="landing-section__header">
          <h2 className="landing-section__title">From completed work to verified record in minutes</h2>
        </div>

        <div className="steps-container">
          {steps.map((step, idx) => {
            const StepIcon = step.icon
            return (
              <React.Fragment key={idx}>
                <div className="step-card">
                  <span className="step-card__badge">{step.number}</span>
                  <div className="step-card__icon">
                    <StepIcon size={24} />
                  </div>
                  <h3 className="step-card__title">{step.title}</h3>
                  <p className="step-card__body">{step.body}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="step-arrow">
                    <ArrowRight size={20} />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function PricingSection() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="landing-section">
      <div className="landing-section__header">
        <h2 className="landing-section__title">Simple pricing for every team size</h2>
        <p className="landing-section__subtitle">Start free. Scale as your projects grow.</p>
      </div>

      <div className="pricing-grid">
        {/* Card 1 */}
        <div className="pricing-card">
          <h3 className="pricing-card__title">Starter (Free)</h3>
          <p className="pricing-card__subtitle">For small teams and pilots</p>
          <div className="pricing-card__price">₹0 <span style={{fontSize: '14px', fontWeight: 500, color: 'var(--color-gray-500)'}}>/ month</span></div>
          <ul className="pricing-card__features">
            <li className="checked"><Check size={16} color="#22a55e" /> Up to 2 active projects</li>
            <li className="checked"><Check size={16} color="#22a55e" /> 5 team members</li>
            <li className="checked"><Check size={16} color="#22a55e" /> Basic chisel & verify workflow</li>
            <li className="checked"><Check size={16} color="#22a55e" /> 30-day history</li>
            <li className="disabled"><X size={16} /> AI anomaly detection</li>
            <li className="disabled"><X size={16} /> Contractor credentialing</li>
          </ul>
          <button className="btn btn--ghost btn--block" onClick={() => navigate('/login')}>
            Get Started Free
          </button>
        </div>

        {/* Card 2 - Most Popular */}
        <div className="pricing-card pricing-card--popular">
          <span className="pricing-badge">Most Popular</span>
          <h3 className="pricing-card__title">Professional</h3>
          <p className="pricing-card__subtitle">For growing construction firms</p>
          <div className="pricing-card__price">₹4,999 <span style={{fontSize: '14px', fontWeight: 500, color: 'var(--color-gray-500)'}}>/ month</span></div>
          <ul className="pricing-card__features">
            <li className="checked"><Check size={16} color="#22a55e" /> Unlimited projects</li>
            <li className="checked"><Check size={16} color="#22a55e" /> Up to 50 team members</li>
            <li className="checked"><Check size={16} color="#22a55e" /> Full chisel & verify workflow</li>
            <li className="checked"><Check size={16} color="#22a55e" /> Unlimited history</li>
            <li className="checked"><Check size={16} color="#22a55e" /> AI anomaly detection</li>
            <li className="checked"><Check size={16} color="#22a55e" /> Issue tracking & assignment</li>
            <li className="disabled"><X size={16} /> Contractor credentialing</li>
          </ul>
          <button className="btn btn--primary btn--block" onClick={() => navigate('/signup')}>
            Start Free Trial
          </button>
        </div>

        {/* Card 3 */}
        <div className="pricing-card">
          <h3 className="pricing-card__title">Enterprise</h3>
          <p className="pricing-card__subtitle">For large contractors and PMCs</p>
          <div className="pricing-card__price" style={{fontSize: '28px'}}>Custom pricing</div>
          <ul className="pricing-card__features">
            <li className="checked"><Check size={16} color="#22a55e" /> Everything in Professional</li>
            <li className="checked"><Check size={16} color="#22a55e" /> Unlimited team members</li>
            <li className="checked"><Check size={16} color="#22a55e" /> Contractor credentialing</li>
            <li className="checked"><Check size={16} color="#22a55e" /> BIM & Procore integration</li>
            <li className="checked"><Check size={16} color="#22a55e" /> Dedicated support</li>
            <li className="checked"><Check size={16} color="#22a55e" /> Custom onboarding</li>
          </ul>
          <button className="btn btn--ghost btn--block" onClick={() => window.location.href = 'mailto:sales@chisel.build'}>
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  )
}

export function SecuritySection() {
  return (
    <section id="security" className="landing-section landing-section--alt">
      <div className="landing-section__inner" style={{ textAlign: 'center', maxWidth: '800px' }}>
        <h2 className="landing-section__title">Cryptographic & Tamper-Evident History</h2>
        <p className="landing-section__subtitle" style={{ lineHeight: '1.6' }}>
          Chisel's security model uses append-only hash chains, EXIF metadata verification, perceptual photo hashing, and DPDPA 2023 compliance to ensure that every record on your jobsite is immutable and legally defensible.
        </p>
      </div>
    </section>
  )
}

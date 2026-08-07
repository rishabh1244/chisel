import heroConstruction from '../assets/hero-construction.png'
import dashboardPreview from '../assets/dashboard-preview.png'
import dashboardPreview2 from '../assets/dashboard-preview2.png'
import loginBlueprint from '../assets/login-blueprint.png'

export const SAMPLE_IMAGES = [
  { id: 'hero', label: 'Construction site', src: heroConstruction },
  { id: 'blueprint', label: 'Blueprint sketch', src: loginBlueprint },
  { id: 'preview', label: 'Dashboard render', src: dashboardPreview },
  { id: 'preview2', label: 'Towers render', src: dashboardPreview2 },
  { id: 'placeholder', label: 'Building 3D', src: '/assets/placeholder-building.png' },
]

export function sampleImageFor(project) {
  const index = (project?.title?.length || 0) % SAMPLE_IMAGES.length
  return SAMPLE_IMAGES[index].src
}

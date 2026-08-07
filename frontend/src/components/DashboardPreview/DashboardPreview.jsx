import dashboardImage from '../../assets/dashboard-preview2.png'
function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      <img
        className="dashboard-preview__image"
        src={dashboardImage}
        alt="Chisel dashboard showing Skyline Towers project overview"
      />
    </div>
  )
}

export default DashboardPreview

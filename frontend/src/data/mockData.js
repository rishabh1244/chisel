export const InitialData = {
  project: {
    name: 'Skyline Towers',
    description: 'Residential complex with 3 towers, clubhouse and basement parking.',
    code: 'ST-2024',
    startDate: '12 Jan 2024',
    targetDate: '30 Dec 2025',
    progress: 42,
    budget: '₹ 2,45,00,000',
    spent: '₹ 1,32,00,000',
    currency: 'INR - Indian Rupee',
    status: 'Active'
  },
  issues: [
    {
      id: '#ISS-42',
      priority: 'High',
      title: 'Crack in column C-8',
      assigneeName: 'Arjun Patel',
      assigneeAvatar: 'AP',
      assigneeColor: '#f97316',
      dueDate: '12 Jan 2025',
      dueText: 'Due today',
      dueUrgent: true,
      status: 'Open',
      description: 'Visible crack detected in column C-8 on Level 3 grid intersection. Requires structural inspection before proceeding with formwork.',
      activity: [
        { author: 'Arjun Patel', avatar: 'AP', action: 'created this issue', time: '2h ago' },
        { author: 'Neha Singh', avatar: 'NS', action: 'commented "Will inspect tomorrow morning"', time: '1h ago' }
      ]
    },
    {
      id: '#ISS-37',
      priority: 'Medium',
      title: 'Beam reinforcement mismatch',
      assigneeName: 'Neha Singh',
      assigneeAvatar: 'NS',
      assigneeColor: '#8b5cf6',
      dueDate: '14 Jan 2025',
      dueText: 'Due in 2 days',
      dueUrgent: false,
      status: 'Open',
      description: 'Rebar spacing in Beam B-12 does not match drawing spec ST-B12-REV2. Need verification from structural lead.',
      activity: [
        { author: 'Neha Singh', avatar: 'NS', action: 'flagged rebar spacing discrepancy', time: '4h ago' }
      ]
    },
    {
      id: '#ISS-35',
      priority: 'Low',
      title: 'Material delay',
      assigneeName: 'Vikram Joshi',
      assigneeAvatar: 'VJ',
      assigneeColor: '#10b981',
      dueDate: '17 Jan 2025',
      dueText: 'Due in 5 days',
      dueUrgent: false,
      status: 'Resolved',
      description: 'Grade 50 cement batch shipment delayed by 2 days due to transit checkpoint issues. Alternative vendor sourced.',
      activity: [
        { author: 'Vikram Joshi', avatar: 'VJ', action: 'marked as resolved after shipment arrived', time: '1d ago' }
      ]
    },
    {
      id: '#ISS-29',
      priority: 'High',
      title: 'Water leakage in basement',
      assigneeName: 'Rahul Mehta',
      assigneeAvatar: 'RM',
      assigneeColor: '#3b82f6',
      dueDate: '19 Jan 2025',
      dueText: 'Due in 7 days',
      dueUrgent: false,
      status: 'Open',
      description: 'Seepage observed near south retaining wall in Basement B2. Waterproofing membrane check required.',
      activity: [
        { author: 'Rahul Mehta', avatar: 'RM', action: 'logged basement seepage report', time: '2d ago' }
      ]
    }
  ],
  changes: [
    {
      id: 'CHG-128',
      iconType: 'blue',
      title: 'Foundation layout updated',
      subtitle: 'Drawing updated: foundation_v2.dwg',
      author: 'Arjun Patel',
      time: '2 hours ago',
      status: 'Approved',
      description: 'Foundation grid 3A-4C offset updated by +150mm as per soil bearing report. Photo evidence submitted for review.',
      signals: [
        { author: 'Neha Singh', time: '3h ago' },
        { author: 'Rahul Mehta', time: '4h ago' }
      ]
    },
    {
      id: 'CHG-127',
      iconType: 'purple',
      title: 'Beam B-12 dimensions changed',
      subtitle: 'Changed: Beam details in Level 2',
      author: 'Neha Singh',
      time: '5 hours ago',
      status: 'Pending Review',
      description: 'Beam section depth increased to 600mm to accommodate higher live load rating on floor slab.',
      signals: [
        { author: 'Arjun Patel', time: '1h ago' }
      ]
    },
    {
      id: 'CHG-126',
      iconType: 'orange',
      title: 'Column C-8 position modified',
      subtitle: 'Changed: Column position in Grid 3A',
      author: 'Rahul Mehta',
      time: '1 day ago',
      status: 'Approved',
      description: 'Column grid alignment adjusted to align with elevator shaft wall specs.',
      signals: [
        { author: 'Vikram Joshi', time: '1d ago' }
      ]
    },
    {
      id: 'CHG-125',
      iconType: 'green',
      title: 'Electrical routing updated',
      subtitle: 'Drawing updated: electrical_layout.dwg',
      author: 'Vikram Joshi',
      time: '2 days ago',
      status: 'Approved',
      description: 'Conduit layout updated for Level 1 main distribution panel connection.',
      signals: [
        { author: 'Neha Singh', time: '2d ago' }
      ]
    },
    {
      id: 'CHG-124',
      iconType: 'red',
      title: 'Slab thickness modified',
      subtitle: 'Changed: Slab S-3 thickness',
      author: 'Neha Singh',
      time: '2 days ago',
      status: 'Pending Review',
      description: 'Slab thickness updated from 150mm to 175mm at cantilever balcony projection.',
      signals: []
    }
  ],
  files: [
    { id: 1, type: 'dwg', iconColor: '#3b82f6', name: 'foundation_v2.dwg', size: '2.4 MB', by: 'Arjun Patel', date: '2 hours ago' },
    { id: 2, type: 'dwg', iconColor: '#10b981', name: 'electrical_layout.dwg', size: '1.8 MB', by: 'Vikram Joshi', date: '2 days ago' },
    { id: 3, type: 'jpg', iconColor: '#f97316', name: 'site_progress_25_may.jpg', size: '4.1 MB', by: 'Rahul Mehta', date: '6 hours ago' },
    { id: 4, type: 'pdf', iconColor: '#ef4444', name: 'structural_report_may.pdf', size: '890 KB', by: 'Neha Singh', date: '3 days ago' }
  ],
  team: [
    { id: 1, name: 'Arjun Patel', avatar: 'AP', color: '#f97316', role: 'Project Manager', status: 'Online', joined: 'Jan 2024' },
    { id: 2, name: 'Neha Singh', avatar: 'NS', color: '#8b5cf6', role: 'Structural Eng.', status: 'Online', joined: 'Jan 2024' },
    { id: 3, name: 'Rahul Mehta', avatar: 'RM', color: '#3b82f6', role: 'Civil Engineer', status: 'Online', joined: 'Feb 2024' },
    { id: 4, name: 'Vikram Joshi', avatar: 'VJ', color: '#10b981', role: 'Electrical Eng.', status: 'Online', joined: 'Feb 2024' },
    { id: 5, name: 'Priya Sharma', avatar: 'PS', color: '#ec4899', role: 'Safety Officer', status: 'Offline', joined: 'Mar 2024' },
    { id: 6, name: 'Karan Mehta', avatar: 'KM', color: '#6366f1', role: 'QA Engineer', status: 'Offline', joined: 'Mar 2024' }
  ]
}

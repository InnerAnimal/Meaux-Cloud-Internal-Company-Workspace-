import React, { useState } from 'react'

interface Task {
  id: number
  title: string
  description: string
  assignee: { name: string; avatar: string; color: string }
  priority: 'high' | 'medium' | 'low'
}

const MeauxBoardSection: React.FC = () => {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    todo: [
      { id: 1, title: 'Setup Cloudflare R2', description: 'Configure buckets for team asset storage with zero egress fees', assignee: { name: 'Sam', avatar: 'S', color: 'var(--primary-color)' }, priority: 'high' },
      { id: 2, title: 'Email Templates', description: 'Design cohesive templates for team communications', assignee: { name: 'Fred', avatar: 'F', color: 'var(--accent-orange)' }, priority: 'medium' },
      { id: 3, title: 'Documentation Update', description: 'Add deployment guides to MeauxDocs', assignee: { name: 'Connor', avatar: 'C', color: '#64748b' }, priority: 'low' },
    ],
    progress: [
      { id: 4, title: 'MeauxTalk Integration', description: 'Connect real-time messaging with Supabase', assignee: { name: 'Connor', avatar: 'C', color: '#64748b' }, priority: 'high' },
      { id: 5, title: 'Daily.co Video', description: 'Implement Meet video calls', assignee: { name: 'Sam', avatar: 'S', color: 'var(--primary-color)' }, priority: 'high' },
    ],
    review: [
      { id: 6, title: 'Team Email System', description: 'Configure @meauxbility.org addresses', assignee: { name: 'Sam', avatar: 'S', color: 'var(--primary-color)' }, priority: 'medium' },
    ],
    done: [
      { id: 7, title: 'Meaux Access Logo', description: 'Cloud logo with M lettermark', assignee: { name: 'Fred', avatar: 'F', color: 'var(--accent-orange)' }, priority: 'high' },
      { id: 8, title: 'Supabase Setup', description: 'Database and auth configured', assignee: { name: 'Connor', avatar: 'C', color: '#64748b' }, priority: 'high' },
      { id: 9, title: 'Vercel Deployment', description: 'Production environment live', assignee: { name: 'Connor', avatar: 'C', color: '#64748b' }, priority: 'medium' },
      { id: 10, title: 'SVG Icon Library', description: 'Custom icons for dashboard', assignee: { name: 'Fred', avatar: 'F', color: 'var(--accent-orange)' }, priority: 'low' },
    ],
  })

  const columns = [
    { id: 'todo', label: '📋 To Do', tasks: tasks.todo },
    { id: 'progress', label: '⚙️ In Progress', tasks: tasks.progress },
    { id: 'review', label: '👀 Review', tasks: tasks.review },
    { id: 'done', label: '✅ Done', tasks: tasks.done },
  ]

  return (
    <section id="meauxboard-section" className="content-section active">
      <div className="header">
        <h1>MeauxBoard - Projects</h1>
        <div className="header-actions">
          <button className="header-btn btn-primary">
            <i className="fas fa-plus"></i>
            New Task
          </button>
          <button className="header-btn">
            <i className="fas fa-filter"></i>
            Filter
          </button>
        </div>
      </div>

      <div className="board-container">
        <div className="board-columns">
          {columns.map((column) => (
            <div key={column.id} className="board-column">
              <div className="column-header">
                <div className="column-title">
                  <span>{column.label}</span>
                  <span className="column-count">{column.tasks.length}</span>
                </div>
              </div>
              <div className="column-cards">
                {column.tasks.map((task) => (
                  <div key={task.id} className="task-card" draggable style={{ opacity: column.id === 'done' ? 0.7 : 1 }}>
                    <div className="task-title">{task.title}</div>
                    <div className="task-description">{task.description}</div>
                    <div className="task-meta">
                      <div className="task-assignee">
                        <div className="task-avatar" style={{ background: task.assignee.color }}>{task.assignee.avatar}</div>
                        <span>{task.assignee.name}</span>
                      </div>
                      <span className={`task-priority priority-${task.priority}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                    </div>
                  </div>
                ))}
                <div className="add-card-btn">
                  <i className="fas fa-plus"></i> Add card
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MeauxBoardSection


import React, { useState } from 'react'

const MeauxDocsSection: React.FC = () => {
  const [title, setTitle] = useState('Brand Guidelines')
  const [content, setContent] = useState(`<h2>Meauxbility & Inner Animals Brand Guidelines</h2>
<p><br></p>
<h3>Color Palette</h3>
<p>Our primary brand colors represent trust, innovation, and energy:</p>
<ul>
  <li><strong>Teal Steel (#1F97A9)</strong> - Primary brand color representing trust and innovation</li>
  <li><strong>Orange Accent (#FF7619)</strong> - Secondary color for energy and calls-to-action</li>
  <li><strong>Neutral Grays</strong> - Supporting colors for text and backgrounds</li>
</ul>
<p><br></p>
<h3>Typography</h3>
<p>We use Inter for all digital communications. It's clean, modern, and highly readable across all devices.</p>
<ul>
  <li><strong>Headings:</strong> Inter Bold (700-800)</li>
  <li><strong>Body:</strong> Inter Regular (400)</li>
  <li><strong>Captions:</strong> Inter Medium (500-600)</li>
</ul>
<p><br></p>
<h3>Logo Usage</h3>
<p>The Meaux Access cloud logo should always have clear space around it equal to the height of the "M" lettermark. Never distort, rotate, or alter the colors of the logo.</p>
<p><br></p>
<h3>Voice & Tone</h3>
<p>Our brand voice is:</p>
<ul>
  <li><strong>Authentic</strong> - We speak from real experience and lived challenges</li>
  <li><strong>Empowering</strong> - We help others transform obstacles into opportunities</li>
  <li><strong>Professional</strong> - We deliver quality work with technical expertise</li>
  <li><strong>Human</strong> - We never lose sight of the people we serve</li>
</ul>`)

  const formatText = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value || undefined)
  }

  const saveDoc = () => {
    console.log('Saving document:', { title, content })
    alert('Document saved!')
  }

  return (
    <section id="meauxdocs-section" className="content-section active">
      <div className="header">
        <h1>MeauxDocs - Brand Guidelines</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={saveDoc}>
            <i className="fas fa-save"></i>
            Save
          </button>
          <button className="header-btn">
            <i className="fas fa-share"></i>
            Share
          </button>
        </div>
      </div>

      <div className="docs-container">
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button className="toolbar-btn" onClick={() => formatText('bold')} title="Bold">
              <i className="fas fa-bold"></i>
            </button>
            <button className="toolbar-btn" onClick={() => formatText('italic')} title="Italic">
              <i className="fas fa-italic"></i>
            </button>
            <button className="toolbar-btn" onClick={() => formatText('underline')} title="Underline">
              <i className="fas fa-underline"></i>
            </button>
          </div>
          <div className="toolbar-group">
            <button className="toolbar-btn" onClick={() => formatText('formatBlock', 'h2')} title="Heading 1">
              <strong style={{ fontSize: '0.75rem' }}>H1</strong>
            </button>
            <button className="toolbar-btn" onClick={() => formatText('formatBlock', 'h3')} title="Heading 2">
              <strong style={{ fontSize: '0.75rem' }}>H2</strong>
            </button>
          </div>
          <div className="toolbar-group">
            <button className="toolbar-btn" onClick={() => formatText('insertUnorderedList')} title="Bullet List">
              <i className="fas fa-list-ul"></i>
            </button>
            <button className="toolbar-btn" onClick={() => formatText('insertOrderedList')} title="Numbered List">
              <i className="fas fa-list-ol"></i>
            </button>
          </div>
          <div className="toolbar-group">
            <button className="toolbar-btn" onClick={() => {
              const url = prompt('Enter URL:')
              if (url) formatText('createLink', url)
            }} title="Insert Link">
              <i className="fas fa-link"></i>
            </button>
          </div>
        </div>

        <div className="doc-editor">
          <input
            type="text"
            className="doc-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Document"
          />
          <div
            className="doc-content"
            contentEditable
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
          />
        </div>
      </div>
    </section>
  )
}

export default MeauxDocsSection


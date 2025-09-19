import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi'; 

const Sidebar = ({ projects, onSelectProject, onVisualizeAll }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="sidebar">
      <h3>My Projects</h3>

      <div className="search-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="project-search-input"
        />
      </div>

      <ul>
        {filteredProjects.length === 0 ? (
          <li>No matching projects</li>
        ) : (
          filteredProjects.map((name) => (
            <li key={name} onClick={() => onSelectProject(name)}>
              {name}
            </li>
          ))
        )}
      </ul>

      <div className="visualize-all">
        <button onClick={onVisualizeAll}>Visualize All Projects</button>
      </div>
    </aside>
  );
};

export default Sidebar;


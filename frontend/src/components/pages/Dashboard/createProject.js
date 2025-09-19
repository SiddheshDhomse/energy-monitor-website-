
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../Navbar'; 
import Sidebar from './projectList';
import Graphs from './Graphs';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';


const CreateProject = () => {
  
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [runData, setRunData] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const [showAllGraphs, setShowAllGraphs] = useState(false);
  const [avgData, setAvgData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");

  const fetchProjects = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await axios.post('http://localhost:3500/users/getProjects', {
        email: user.email
      });
      setProjects(res.data.projectNames || []);
    } catch (err) {
      toast.error("Failed to load projects");
    }
  }, [user?.email]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return toast.error("Enter project name");

    try {
      await axios.post('http://localhost:3500/users/addProject', {
        email: user.email,
        projectName: projectName.trim()
      });

      toast.success("Project created successfully!");
      setProjectName('');
      fetchProjects();
    } catch (err) {
      toast.error("Failed to create project");
    }
  };

  const handleVisualizeAll = async () => {
    try {
      const res = await axios.post('http://localhost:3500/users/getAllProjectAverages', {
        email: user.email
      });
      setAvgData(res.data.averages || []);
      setShowAllGraphs(true);
      setRunData([]);
      setSelectedProject('');
    } catch (err) {
      toast.error("Failed to fetch average data");
    }
  };

  const handleProjectSelect = async (name) => {
    setSelectedProject(name);
    setShowAllGraphs(false);
    setAvgData([]);

    try {
      const res = await axios.post('http://localhost:3500/users/getProjectRuns', {
        email: user.email,
        projectName: name
      });

      const formatted = Object.entries(res.data.runs).map(([key, val]) => ({
        run: key,
        energy: Number(val.energy),
        power: Number(val.power),
        duration: Number(val.duration),
        timestamp: val.timestamp    
      }));

      setRunData(formatted);
    } catch (err) {
      toast.error("Could not load run data");
    }
  };

  return (
    <>
  <Navbar />
  <Toaster position="top-right" />

  <div className="dashboard-scroll-wrapper">
    <div className="create-project-layout">
      <h2>Create New Project</h2>
      <p>Start tracking energy usage by creating your project below.</p>
      <form onSubmit={handleSubmit} className="project-form-inline">
        <label htmlFor="projectName">Project Name:</label>
        <input
          id="projectName"
          type="text"
          placeholder="Enter project name here"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>

    <div className="page-layout">
      <Sidebar
        projects={projects}
        onSelectProject={handleProjectSelect}
        onVisualizeAll={handleVisualizeAll}
      />
       <Graphs
        runData={runData}
        avgData={avgData}
        selectedProject={selectedProject}
        showAllGraphs={showAllGraphs}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
      />
    </div>
  </div>
</>

  );
};

export default CreateProject;


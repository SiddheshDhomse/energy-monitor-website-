import React from 'react';
import Navbar from '../Navbar';
import heroImage from '../assets/energy_hero.png';
import { Link } from 'react-router-dom';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <>
      <Navbar />
      <section className="hero">
        <div className="hero-text">
          <p className="intro">Empowering sustainable AI</p>
          <h1 className="hero-title">
            Monitor Your Model's <br /> Energy Usage
          </h1>
          <p className="description">
            Welcome{user?.username ? `, ${user.username}` : ''}! Track your GPU’s power consumption during machine learning model training.
            Our library <strong>energyCalculator</strong> uses NVIDIA’s NVML API to log real-time power data
            every 5 minutes and store it project-wise in MongoDB — no manual input needed.
            Gain insight into your AI workflow’s environmental footprint.
          </p>

         
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/create-project" className="get-started-btn">Get Started</Link>
            <a
              href="https://pypi.org/project/energyCnV/"
              target="_blank"
              rel="noopener noreferrer"
              className="get-started-btn"
            >
              How to Use
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img src={heroImage} alt="Energy monitoring illustration" />
        </div>
      </section>
    </>
  );
};

export default Home;



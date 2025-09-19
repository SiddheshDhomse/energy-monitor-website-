import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import co2Data from '../../assets/co2Grid.json';

const Graphs = ({
  runData,
  avgData,
  selectedProject,
  showAllGraphs,
  selectedRegion,
  onRegionChange
}) => {
  const [carbonDataByRun, setCarbonDataByRun] = useState([]);
  const [selectedRunInfo, setSelectedRunInfo] = useState(null);

  useEffect(() => {
    console.log('useEffect triggered: runData or selectedRegion changed');
    if (!selectedRegion || !runData || runData.length === 0) {
      console.log('No selectedRegion or empty runData; clearing carbonDataByRun and selectedRunInfo');
      setCarbonDataByRun([]);
      setSelectedRunInfo(null);
      return;
    }

    const updatedCarbonData = runData.map(run => {
      const timestamp = new Date(run.timestamp);
      const month = timestamp.getMonth() + 1;
      console.log(`Processing run ${run.run} with timestamp month: ${month}`);

      const match = co2Data.find(d =>
        d["Zone name"] === selectedRegion &&
        new Date(d["Datetime (UTC)"]).getMonth() + 1 === month
      );

      if (match) {
        console.log(`Match found for run ${run.run} in region ${selectedRegion} for month ${month}`, match);
        return {
          run: run.run,
          direct: match["Carbon intensity gCO₂eq/kWh (direct)"],
          cfe: match["Carbon-free energy percentage (CFE%)"],
          re: match["Renewable energy percentage (RE%)"]
        };
      } else {
        console.warn(`No match found for run ${run.run} in region ${selectedRegion} for month ${month}`);
        return {
          run: run.run,
          direct: 'N/A',
          cfe: 'N/A',
          re: 'N/A'
        };
      }
    });

    setCarbonDataByRun(updatedCarbonData);
    console.log('Updated carbonDataByRun:', updatedCarbonData);
  }, [runData, selectedRegion]);

  const handleBarClick = (data) => {
    console.log('Bar clicked:', data);
    const info = carbonDataByRun.find(item => item.run === data.run);
    if (info) {
      console.log('Found carbon info for selected run:', info);
      setSelectedRunInfo(info);
    } else {
      console.warn('No carbon info found for selected run:', data.run);
      setSelectedRunInfo(null);
    }
  };

  let totalCO2Emissions = null;
  if (
    selectedRunInfo &&
    selectedRunInfo.direct !== 'N/A'
  ) {
  
    const runEnergyEntry = runData.find(r => r.run === selectedRunInfo.run);
    if (runEnergyEntry && typeof runEnergyEntry.energy === 'number' && !isNaN(runEnergyEntry.energy)) {
      totalCO2Emissions = runEnergyEntry.energy * selectedRunInfo.direct;
      console.log(`Total CO2 emissions for run ${selectedRunInfo.run}: ${totalCO2Emissions} g`);
    } else {
      console.warn(`Energy data missing or invalid for run ${selectedRunInfo.run}`);
    }
  }

  const regionOptions = [
    { label: 'Eastern India (IN-EA)', value: 'Eastern India' },
    { label: 'Western India (IN-WA)', value: 'Western India' },
    { label: 'Northern India (IN-NA)', value: 'Northern India' },
    { label: 'Southern India (IN-SA)', value: 'Southern India' }
  ];

  return (
    <main className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{selectedProject || "Select the project"}</h2>
        <select
          value={selectedRegion}
          onChange={(e) => {
            console.log('Region changed:', e.target.value);
            onRegionChange(e.target.value);
          }}
          style={{ padding: '6px 10px', fontSize: '1rem' }}
        >
          <option value="">Select Region</option>
          {regionOptions.map((region) => (
            <option key={region.value} value={region.value}>
              {region.label}
            </option>
          ))}
        </select>
      </div>

      <div className="custom-card" style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '10px',
        border: '1px solid #ccc'
      }}>
        <h3>🌿 Eco Impact Snapshot</h3>
        {selectedRunInfo ? (
          <>
            <p><strong>Selected Run:</strong> {selectedRunInfo.run}</p>
            <p><strong>Direct CO₂ Intensity:</strong> {selectedRunInfo.direct} gCO₂/kWh</p>
            <p><strong>Carbon-free energy percentage (CFE%):</strong> {selectedRunInfo.cfe}</p>
            <p><strong>Renewable energy percentage (RE%):</strong> {selectedRunInfo.re}</p>
            <p><strong>Total CO₂ Emissions:</strong> {totalCO2Emissions !== null ? totalCO2Emissions.toFixed(2) + ' g' : 'N/A'}</p>
          </>
        ) : (
          <p>Select a run from the energy consumption graph below to view carbon metrics.</p>
        )}
      </div>

      {runData.length > 0 && (
        <>
          <h4>Energy Consumption (kWh)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={runData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="run" />
              <YAxis />
              <Tooltip formatter={(value) => `${value?.toFixed?.(3)} kWh`} />
              <Legend />
              <Bar
                dataKey="energy"
                fill="#28a745"
                name="Energy (kWh)"
                onClick={handleBarClick}
              />
            </BarChart>
          </ResponsiveContainer>

          <h4>Average Power (Watts)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={runData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="run" />
              <YAxis />
              <Tooltip formatter={(value) => `${value?.toFixed?.(2)} W`} />
              <Legend />
              <Bar dataKey="power" fill="#007bff" name="Power (W)" />
            </BarChart>
          </ResponsiveContainer>

          <h4>Duration (Seconds)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={runData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="run" />
              <YAxis />
              <Tooltip formatter={(value) => `${value?.toFixed?.(2)} sec`} />
              <Legend />
              <Bar dataKey="duration" fill="#ffc107" name="Duration (sec)" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
        {showAllGraphs && avgData.length > 0 && (
        <>
          <h3>📊 Project Summary (Energy, Power, Duration)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={avgData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" />
              <YAxis width={80} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="avg_energy" stroke="#28a745" fill="59a14f" name="Energy (kWh)" />
              <Area type="monotone" dataKey="avg_power" stroke="#007bff" fill="#4e79a7" name="Power (W)" />
              <Area type="monotone" dataKey="avg_duration" stroke="#ffc107" fill="#f28e2b" name="Duration (sec)" />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}

    </main>
  );
};

export default Graphs;








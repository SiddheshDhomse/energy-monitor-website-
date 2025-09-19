const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

// ====================== Signup =======================
const addUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    projects: {}
  });

  if (user) {
    res.status(201).json({ message: 'User registered successfully' });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// =================== Login ===================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

  res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      username: user.username,
      email: user.email
    }
  });
});

// =================== Add Project ===================
const addProjectToUser = asyncHandler(async (req, res) => {
  const { email, projectName } = req.body;

  if (!email || !projectName) {
    return res.status(400).json({ message: 'Email and project name are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const fullKey = `projects.${projectName}`;

  const result = await User.updateOne(
    { email },
    { $set: { [fullKey]: {} } }
  );

  if (result.modifiedCount === 1) {
    res.status(200).json({ message: `Project "${projectName}" added successfully` });
  } else {
    res.status(200).json({ message: `Project "${projectName}" already exists or unchanged` });
  }
});

const getUserProjects = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email }).lean(); 
  if (!user || !user.projects || typeof user.projects !== 'object') {
    return res.status(404).json({ message: 'User or projects not found' });
  }

  const projectNames = Object.keys(user.projects).filter(name => {
    return typeof user.projects[name] === 'object' && !name.startsWith('$');
  });

  console.log("Projects for user:", email);
  console.log("Project Names:", projectNames);

  return res.status(200).json({ projectNames });
});



// =================== Get Project Runs ===================

const getProjectRuns = asyncHandler(async (req, res) => {
  const { email, projectName } = req.body;

  console.log("/getProjectRuns request");
  console.log("Email:", email, "➡️ Project:", projectName);

  if (!email || !projectName) {
    return res.status(400).json({ message: 'Missing email or project name' });
  }

  const user = await User.findOne({ email }).lean();
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const runs = user.projects?.[projectName];
  if (!runs || typeof runs !== 'object') {
    return res.status(404).json({ message: 'Project not found or has no runs' });
  }

 const formattedRuns = Object.entries(runs).map(([runName, runData]) => {
    const rawTimestamp = runData?.timestamp;
    const validTimestamp = rawTimestamp
      ? new Date(rawTimestamp).toISOString()
      : null;

    return {
      run: runName,
      energy: runData?.energy_kwh ?? null,
      power: runData?.avg_power_watts ?? null,
      duration: runData?.duration ?? null,
      timestamp: validTimestamp,
    };
  });

  console.log("Runs sent for:", projectName);
  console.log("Run Data:", formattedRuns); 

  return res.status(200).json({ runs: formattedRuns });
});

// =================== Get All Project Averages ===================
const getAllProjectAverages = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email }).lean();
  if (!user || !user.projects || typeof user.projects !== 'object') {
    return res.status(404).json({ message: 'User or projects not found' });
  }

  const averages = [];

  for (const [projectName, runs] of Object.entries(user.projects)) {
    const energies = [];
    const powers = [];
    const durations = [];

    for (const run of Object.values(runs)) {
      energies.push(Number(run.energy_kwh));
      powers.push(Number(run.avg_power_watts));
      durations.push(Number(run.duration));
    }

    averages.push({
      project: projectName,
      avg_energy: +(energies.reduce((a, b) => a + b, 0)).toFixed(3),
      avg_power: +(powers.reduce((a, b) => a + b, 0) ).toFixed(3),
      avg_duration: +(durations.reduce((a, b) => a + b, 0)).toFixed(3),
    });
  }

  console.log("📊 Averages per project:", averages);
  res.status(200).json({ averages });
});


module.exports = {
  addUser,
  loginUser,
  addProjectToUser,
  getUserProjects,
  getProjectRuns,
  getAllProjectAverages 
};




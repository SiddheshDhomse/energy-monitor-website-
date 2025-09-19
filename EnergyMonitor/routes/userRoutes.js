const express = require('express');
const router = express.Router();
const { addUser, loginUser, addProjectToUser, getUserProjects,getProjectRuns,getAllProjectAverages } = require('../controllers/usersController');

router.post('/signup', addUser);
router.post('/login', loginUser);
router.post('/addProject', addProjectToUser);
router.post('/getProjectRuns', getProjectRuns);
router.post('/getProjects', getUserProjects);
router.post('/getAllProjectAverages', getAllProjectAverages);


module.exports = router;

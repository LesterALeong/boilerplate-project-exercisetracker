const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// In-memory storage
let users = [];
let exercises = [];
let userIdCounter = 1;

// Helper function to generate ID
function generateId() {
  return userIdCounter++;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// POST /api/users - Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  
  const newUser = {
    username: username,
    _id: generateId().toString()
  };
  
  users.push(newUser);
  
  res.json({
    username: newUser.username,
    _id: newUser._id
  });
});

// GET /api/users - Get all users
app.get('/api/users', (req, res) => {
  const userList = users.map(user => ({
    username: user.username,
    _id: user._id
  }));
  
  res.json(userList);
});

// POST /api/users/:_id/exercises - Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  
  // Find user
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Create exercise
  const exerciseDate = date ? new Date(date) : new Date();
  
  const newExercise = {
    userId: userId,
    description: description,
    duration: parseInt(duration),
    date: exerciseDate
  };
  
  exercises.push(newExercise);
  
  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date.toDateString(),
    _id: user._id
  });
});

// GET /api/users/:_id/logs - Get user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  
  // Find user
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Filter exercises for this user
  let userExercises = exercises.filter(ex => ex.userId === userId);
  
  // Apply date filters if provided
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => ex.date >= fromDate);
  }
  
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => ex.date <= toDate);
  }
  
  // Apply limit if provided
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }
  
  // Format log
  const log = userExercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  }));
  
  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

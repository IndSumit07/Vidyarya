import express from 'express';
import userAuth from '../middlewares/auth.middleware.js';
import {
  createEvent,
  getUserEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByDateRange,
  getUpcomingEvents
} from '../controllers/timetable.controller.js';

const router = express.Router();

// All routes require authentication
router.use(userAuth);

// Create a new event
router.post('/events', createEvent);

// Get all events for the authenticated user
router.get('/events', getUserEvents);

// Get events by date range
router.get('/events/range', getEventsByDateRange);

// Get upcoming events (next 7 days)
router.get('/events/upcoming', getUpcomingEvents);

// Get a specific event by ID
router.get('/events/:id', getEventById);

// Update an event
router.put('/events/:id', updateEvent);

// Delete an event
router.delete('/events/:id', deleteEvent);

export default router;

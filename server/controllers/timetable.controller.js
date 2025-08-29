import TimetableEvent from '../models/timetable.model.js';

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, priority, color, isAllDay, isRecurring, recurringPattern } = req.body;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and date are required' });
    }

    const newEvent = new TimetableEvent({
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      priority: priority || 'medium',
      color: color || '#3B82F6',
      isAllDay: isAllDay || false,
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || 'weekly',
      userId
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event: ' + error.message
    });
  }
};

// Get all events for a user
export const getUserEvents = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { startDate, endDate, month, year } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let query = { userId };

    // Filter by date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Filter by month and year if provided
    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0);
      query.date = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    }

    const events = await TimetableEvent.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events: ' + error.message
    });
  }
};

// Get a specific event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const event = await TimetableEvent.findOne({ _id: id, userId }).populate('userId', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event: ' + error.message
    });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, priority, color, isAllDay, isRecurring, recurringPattern } = req.body;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const event = await TimetableEvent.findOne({ _id: id, userId });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const updatedEvent = await TimetableEvent.findByIdAndUpdate(
      id,
      {
        title,
        description,
        date: date ? new Date(date) : event.date,
        startTime,
        endTime,
        priority,
        color,
        isAllDay,
        isRecurring,
        recurringPattern
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event: ' + error.message
    });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const event = await TimetableEvent.findOne({ _id: id, userId });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await TimetableEvent.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event: ' + error.message
    });
  }
};

// Get events for a specific date range (for calendar view)
export const getEventsByDateRange = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }

    const events = await TimetableEvent.find({
      userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events: ' + error.message
    });
  }
};

// Get upcoming events (next 7 days)
export const getUpcomingEvents = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const events = await TimetableEvent.find({
      userId,
      date: {
        $gte: today,
        $lte: nextWeek
      }
    }).sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming events: ' + error.message
    });
  }
};

const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");

const router = express.Router();

function validObjectId(id) {
  return mongoose.isValidObjectId(id);
}

function validateEventBody(body) {
  const { eventName, eventDescription, eventDate, venue } = body;

  if (
    typeof eventName !== "string" || !eventName.trim() ||
    typeof eventDescription !== "string" || !eventDescription.trim() ||
    typeof venue !== "string" || !venue.trim() ||
    !eventDate || Number.isNaN(Date.parse(eventDate))
  ) {
    return "Enter a valid event name, description, date and venue.";
  }

  return null;
}

// GET /api/events - list events
router.get("/", async (req, res, next) => {
  try {
    const events = await Event.find().sort({ eventDate: 1, createdAt: -1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id - fetch one event
router.get("/:id", async (req, res, next) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    res.json(event);
  } catch (error) {
    next(error);
  }
});

// POST /api/events - create an event
router.post("/", async (req, res, next) => {
  try {
    const validationMessage = validateEventBody(req.body);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const { eventName, eventDescription, eventDate, venue } = req.body;
    const event = await Event.create({
      eventName: eventName.trim(),
      eventDescription: eventDescription.trim(),
      eventDate,
      venue: venue.trim(),
      totalRegistrations: 0
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

// PUT /api/events/:id - update an existing event
router.put("/:id", async (req, res, next) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const validationMessage = validateEventBody(req.body);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const { eventName, eventDescription, eventDate, venue } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        eventName: eventName.trim(),
        eventDescription: eventDescription.trim(),
        eventDate,
        venue: venue.trim()
      },
      { new: true, runValidators: true }
    );

    if (!event) return res.status(404).json({ message: "Event not found." });
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:id - delete an event
router.delete("/:id", async (req, res, next) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    res.json({ message: "Event deleted successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

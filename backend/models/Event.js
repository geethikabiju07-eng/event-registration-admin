const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      maxlength: 100
    },
    eventDescription: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: 2000
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"]
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
      maxlength: 150
    },
    totalRegistrations: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);

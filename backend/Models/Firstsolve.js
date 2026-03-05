const mongoose = require("mongoose");
const Firstsolveschema = new mongoose.Schema({
    handle: { type: String, required: true, index: true },
    problemkey: { type: String, required: true },
    first_solved_time: { type: Number, required: true, index: true },
    rating: { type: Number, default: null },
    tags: { type: [String], default: [] }
}, { timestamps: true });

Firstsolveschema.index(
    {
        handle: 1,
        first_solved_time: 1,
    }
);

Firstsolveschema.index(
    {
        handle: 1,
        problemkey: 1
    }, { unique: true }
);

module.exports = mongoose.model("firstsolves", Firstsolveschema);
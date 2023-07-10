const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  totalBill: { type: Number, required: true },
});

module.exports = mongoose.model("Client", clientSchema);

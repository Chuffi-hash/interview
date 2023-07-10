const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  // Only hash the password if it has been modified or is new
  if (!user.isModified("password")) {
    return next();
  }

  try {
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Set the hashed password
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;

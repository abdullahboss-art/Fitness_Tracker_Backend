// Services/UserService.js
const User = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // ✅ JWT add karo

class UserService {

  // 🔹 REGISTER USER (with JWT token)
  async register(req, res) {
    try {
      const { username, name, email, password } = req.body;

      // Check if user/email already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Username or email already exists" 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await User.create({
        username,
        name,
        email,
        password: hashedPassword,
        profilePic: req.file ? req.file.path : ""
      });

      // ✅ Generate JWT Token
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Return user data without password
      const userData = newUser.toObject();
      delete userData.password;

      res.status(201).json({ 
        success: true,
        message: "User registered successfully ✅", 
        token,
        user: userData
      });

    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: err.message 
      });
    }
  }

  // 🔹 LOGIN USER (with JWT token) - ✅ UPDATED
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid password" 
        });
      }

      // ✅ Generate JWT Token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Return user data without password
      const userData = user.toObject();
      delete userData.password;

      res.status(200).json({ 
        success: true,
        message: "Login successful ✅", 
        token,
        user: userData,
        email: user.email,
        name: user.name,
        profilePic: user.profilePic
      });

    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: err.message 
      });
    }
  }

  // 🔹 GET PROFILE - ✅ UPDATED (better error handling)
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      res.status(200).json({ 
        success: true,
        message: "Profile fetched ✅", 
        user 
      });

    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: err.message 
      });
    }
  }

  // 🔹 UPDATE PROFILE - ✅ UPDATED
  async updateProfile(req, res) {
    try {
      const updates = { ...req.body };
      
      // Handle file upload
      if (req.file) {
        updates.profilePic = req.file.path;
      }

      // Handle password update
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      // Remove undefined fields
      Object.keys(updates).forEach(key => 
        updates[key] === undefined && delete updates[key]
      );

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id, 
        updates, 
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      res.status(200).json({ 
        success: true,
        message: "Profile updated ✅", 
        user: updatedUser 
      });

    } catch (err) {
      res.status(500).json({ 
        success: false,
        message: err.message 
      });
    }
  }

  // 🔹 ADMIN CRUD METHODS (unchanged but add success flags)
  async addUser(req, res) {
    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Email already exists" 
        });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await User.create({ ...req.body, password: hashedPassword });

      res.status(200).json({ 
        success: true,
        message: "User added successfully ✅", 
        data: user 
      });

    } catch (err) {
      res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
  }

  // List all users
  async list(req, res) {
    try {
      const users = await User.find({}).select('-password');
      res.status(200).json({ 
        success: true,
        message: "Success ✅", 
        data: users 
      });

    } catch (err) {
      res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
  }

  // Update user by admin
  async updateUser(req, res) {
    try {
      const data = Array.isArray(req.body) ? req.body[0] : req.body;
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const user = await User.findByIdAndUpdate(req.params.id, data, { new: true }).select('-password');
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      res.status(200).json({ 
        success: true,
        message: "User updated successfully ✅", 
        data: user 
      });

    } catch (err) {
      res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
  }

  // Delete user by admin
  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }

      res.status(200).json({ 
        success: true,
        message: "User deleted successfully ✅", 
        data: user 
      });

    } catch (err) {
      res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
  }

}

module.exports = new UserService();
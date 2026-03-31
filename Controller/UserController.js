

const UserService = require("../Services/UserService");

class UserController {
  // Existing methods
  static list(req, res) {
    UserService.list(req, res);
  }

  static addUser(req, res) {
    UserService.addUser(req, res);
  }

  static updateUser(req, res) {
    UserService.updateUser(req, res);
  }

  static deleteUser(req, res) {
    UserService.deleteUser(req, res);
  }

  // 🔹 Add these methods for auth routes
  static register(req, res) {
    UserService.register(req, res);
  }

  static login(req, res) {
    UserService.login(req, res);
  }

  static getProfile(req, res) {
    UserService.getProfile(req, res);
  }

  static updateProfile(req, res) {
    UserService.updateProfile(req, res);
  }
}

module.exports = UserController;
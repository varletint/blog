import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";

export const test = (req, res) => {
  res.json({ message: "Api is working" });
};

export const updateUser = async (req, res, next) => {
  // if (!req.user.isAdmin || req.user.id !== req.params.userId) {
  //   return next(errorHandler(403, "You are not allowed to update this user"));
  // }
  if (req.body.password) {
    if (req.password.length < 8) {
      return next(errorHandler(400, "Password must be at least 8 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  /*/ if (req.body.username.length < 5 || req.body.username.length > 10) {
  //   return next(
  //     errorHandler(400, "Username must be between 5 and 10 characters")
  //   );
  // }*/
  // if (req.body.username.includes(" ")) {
  //   next(errorHandler(400, "Username cannot contain spaces"));
  // }
  // if (req.body.username !== req.body.username.toLowerCase()) {
  //   return next(errorHandler(400, "Username must lowercase"));
  // }
  // if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
  //   return next(
  //     errorHandler(400, "Username can only contain letters and numbers")
  //   );
  // }
  if (req.body.username) {
    if (req.body.username.length < 5 || req.body.username.length > 10) {
      return next(
        errorHandler(400, "Username must be between 5 and 10 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain spaces"));
    }
    // if (req.body.username !== req.body.username.toLowerCase()) {
    //   return next(errorHandler(400, "Username must be lowercase"));
    // }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username can only contain letters and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          isAuthor: req.body.isAuthor,
          isAdmin: req.body.isAdmin,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "Not allowed to delete this user"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User deleted successfully");
  } catch (error) {
    next(error);
  }
  // console.log("testing");
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been Signed out");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "Your are not allowed to see any user"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    const userWithOutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });
    res.status(200).json({ userWithOutPassword, totalUsers, lastMonthUsers });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    const { password, createdAt, updatedAt, isAdmin, email, ...rest } =
      user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const upGetUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    const { password, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const User = require("../models/User");
const Image = require("../models/Image");

const JWT_SECRET = process.env.JWT_SECRET || "proofmint_jwt_secret_key_2026";
const JWT_EXPIRES_IN = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const verifyGoogleAccessToken = async (accessToken) => {
  const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

const verifyGoogleToken = async (idToken) => {
  if (GOOGLE_CLIENT_ID) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (err) {
      console.warn("OAuth2Client verifyIdToken warning:", err.message);
    }
  }

  // Tokeninfo endpoint directly verifies signature with Google's public keys & checks expiration
  const response = await axios.get(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  return response.data;
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const chosenUsername = (username || name || "").trim();

    if (!chosenUsername || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required.",
      });
    }

    if (chosenUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters long.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    const usernameRegex = new RegExp(`^${escapeRegex(chosenUsername)}$`, "i");
    const existingUsername = await User.findOne({
      $or: [
        { username: usernameRegex },
        { name: usernameRegex },
      ],
    });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "An account with this username already exists. Please choose a different username.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name: chosenUsername,
      username: chosenUsername,
      email: normalizedEmail,
      passwordHash,
    });

    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username || user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration.",
    });
  }
};

// Login existing user (supports either username or email)
const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginIdentifier = (identifier || email || username || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required.",
      });
    }

    const normalized = loginIdentifier.toLowerCase();
    const identifierRegex = new RegExp(`^${escapeRegex(loginIdentifier)}$`, "i");

    // Search user by email (case-insensitive) OR username/name (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: normalized },
        { username: identifierRegex },
        { name: identifierRegex },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password.",
      });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "This account was registered with Google. Please use 'Continue with Google' to sign in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        _id: user._id,
        name: user.name || user.username,
        username: user.username || user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login.",
    });
  }
};

// Google OAuth Sign In / Sign Up
const googleAuth = async (req, res) => {
  try {
    const { idToken, credential, accessToken } = req.body;
    const tokenToVerify = idToken || credential;

    let payload;
    try {
      if (tokenToVerify) {
        payload = await verifyGoogleToken(tokenToVerify);
      } else if (accessToken) {
        payload = await verifyGoogleAccessToken(accessToken);
      } else {
        return res.status(400).json({
          success: false,
          message: "Google ID token (credential) or access token is required.",
        });
      }
    } catch (verifErr) {
      console.error("Google token verification failed:", verifErr.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token. Please sign in again.",
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not contain a verified email address.",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase().trim();
    const googleName = (payload.name || payload.given_name || email.split("@")[0] || "User").trim();

    // 1. Search for existing user by googleId or email
    let user = await User.findOne({
      $or: [
        { googleId: googleId },
        { email: email },
      ],
    });

    if (user) {
      // If user exists, link Google ID if not yet linked
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.username && user.name) {
        user.username = user.name;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // 2. Create new user with a clean, unique username
      let baseUsername = googleName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      if (!baseUsername || baseUsername.length < 3) {
        baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      }
      if (!baseUsername || baseUsername.length < 3) {
        baseUsername = "user";
      }

      let candidateUsername = baseUsername;
      let counter = 1;
      while (
        await User.findOne({
          $or: [
            { username: new RegExp(`^${escapeRegex(candidateUsername)}$`, "i") },
            { name: new RegExp(`^${escapeRegex(candidateUsername)}$`, "i") },
          ],
        })
      ) {
        candidateUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
        counter++;
        if (counter > 10) {
          candidateUsername = `${baseUsername}_${Date.now().toString().slice(-4)}`;
          break;
        }
      }

      user = new User({
        name: candidateUsername,
        username: candidateUsername,
        email: email,
        googleId: googleId,
      });

      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Google authentication successful.",
      token,
      user: {
        _id: user._id,
        name: user.name || user.username,
        username: user.username || user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Google Auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during Google authentication.",
    });
  }
};

// Get current user profile + image count
const getMe = async (req, res) => {
  try {
    const registeredCount = await Image.countDocuments({ owner: req.user._id });

    return res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name || req.user.username,
        username: req.user.username || req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
        registeredCount,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching user profile.",
    });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getMe,
};

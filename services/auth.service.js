const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AccountModel = require("../models/account.schema");
const TokenModel = require("../models/token.schema");
const UserModel = require("../models/user.schema");

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  }

  async registerUser(userData) {
    const { username, password, email } = userData;

    // validate input
    if (!username || !email || !password) {
      throw new Error("[Error][Missing] Required fields are missing");
    }

    // check for existing account
    const existingAccount = await AccountModel.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (existingAccount) {
      throw new Error("[Error][Exist] Account already exists");
    }

    // create new account
    const newUser = new AccountModel({
      username: username,
      email: email,
      password: await bcrypt.hash(password, 10),
    });
    const savedAccount = await newUser.save();

    // create new user profile
    const defaultAvatars = [
      "https://i.pinimg.com/736x/9e/5c/c8/9e5cc8988ced2938cb52367395c238ae.jpg",
      "https://i.pinimg.com/1200x/fc/31/5a/fc315a4736b5b22cbfb96cd9ea786952.jpg",
      "https://i.pinimg.com/1200x/97/a0/ef/97a0eff3eb0fbbbbc0f71565caec94a9.jpg",
      "https://i.pinimg.com/1200x/c1/12/5d/c1125d529a1d1886cc2eaf0a7bca8d1d.jpg",
      "https://i.pinimg.com/1200x/4f/13/1d/4f131d9a7a9f9d7ad1781a799616e92c.jpg",
      "https://i.pinimg.com/1200x/fb/4f/1e/fb4f1ef3f1baf2c956a84a586498f5ef.jpg",
    ];

    const defaultThumbnails = [
      "https://img.freepik.com/free-vector/egyptian-pyramids-night-landscape-cartoon_1441-3185.jpg?t=st=1735233759~exp=1735237359~hmac=ca7de749a0655223c602f4efbf4a620073cfb1421fb0409e144a197a371e03e4&w=1380",
      "https://img.freepik.com/free-photo/neon-hologram-tiger_23-2151558673.jpg?t=st=1735233616~exp=1735237216~hmac=6b97d964a77760968a63ef7e4ce6dd38c6243362cde2aee1f14f6a75e8fbef03&w=1380",
      "https://img.freepik.com/free-photo/bigfoot-represented-neon-glow_23-2151322914.jpg?t=st=1735233822~exp=1735237422~hmac=afc8ab7bed437f1e3a7529734c80dbd2758739b93ddeba3c8e39411cdafb373d&w=1380",
      "https://img.freepik.com/free-photo/fantasy-water-character_23-2151149313.jpg?t=st=1735233865~exp=1735237465~hmac=de2b83b6a9760063a36ab3a0642ace25025bacf62a936ca8f05d70dc65b3be14&w=1380",
    ];

    const newUserProfile = new UserModel({
      _id: savedAccount._id,
      name: username,
      avatarUrl:
        defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)],
      bgUrl:
        defaultThumbnails[Math.floor(Math.random() * defaultThumbnails.length)],
      description:
        "Passionate stamp collector with an eye for rare and unique finds. Dedicated to preserving the history and artistry of philately, constantly expanding and curating a diverse collection from around the world.",
    });
    await newUserProfile.save();

    return savedAccount;
  }

  async login(userData) {
    const { username, password } = userData;

    let account = await AccountModel.findOne({ username: username });

    if (!account) {
      // find by email
      account = await AccountModel.findOne ({ email: username });

      if (!account) {
        throw new Error("[Error][NoneExist] Account not found");
      }
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      throw new Error("[Error][Unvalid] Incorrect password");
    }

    const accessToken = this.generateAccessToken(account);
    const refreshToken = this.generateRefreshToken(account);

    // save refresh token to database
    const newToken = new TokenModel({
      userId: account._id,
      token: refreshToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    await newToken.save();

    const user = await UserModel.findById(account._id);

    return {
      account,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new Error("[Error][Missing] No refresh token provided");
    }

    const savedToken = await TokenModel.findOne({ token: refreshToken });

    if (!savedToken) {
      throw new Error("[Error][Invalid] Invalid refresh token");
    }

    // check expired refresh token
    if (savedToken.expiresAt < Date.now()) {
      await TokenModel.deleteOne({ token: refreshToken });
      throw new Error("Refresh token expired");
    }

    try {
      const decoded = jwt.verify(
        savedToken.token,
        process.env.REFRESH_TOKEN_SECRET
      );

      const account = await AccountModel.findById(decoded.id);
      if (!account) {
        throw new Error("[Error][NonExist] Account not found");
      }

      const accessToken = this.generateAccessToken(account);

      return { accessToken };
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("[Error][Expire] Refresh token expired");
      }

      if (error.name === "JsonWebTokenError") {
        throw new Error("[Error][Invalid] Invalid refresh token");
      }

      throw error;
    }
  }

  async logout(userId) {
    if (!userId) {
      throw new Error("[Error][Missing] No user ID provided");
    }

    try {
      await TokenModel.deleteMany({ userId });
      return true;
    } catch (error) {
      throw new Error("[Error][Other] Failed to logout");
    }
  }
}

module.exports = new AuthService();

import {
  getUsers,
  createUser,
  deleteUser,
  signIn,
  signOut,
  generateTokens,
  patchUser,
  getMe,
} from "./services.js";
import {
  HttpError,
  formatErrorResponse,
  formatResponse,
} from "../../utils/http.js";

export const handleGetUsers = async (req, res) => {
  try {
    const { limit, cursor, search, role } = req.query;

    const { data, nextCursor, total, hasNextPage } = await getUsers({
      limit,
      cursor,
      search,
      role,
    });

    res
      .status(200)
      .json(formatResponse(data, nextCursor, { total, hasNextPage }));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error getting users"));
  }
};

export const handleCreateUser = async (req, res) => {
  try {
    const { email, fullName, role, password } = req.body;

    const data = await createUser({ email, fullName, role, password });

    res.status(201).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error creating user"));
  }
};

export const handleDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    await deleteUser({ userIds });

    return res.status(200).json({ message: `${userIds} successfully deleted` });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse(`Error deleting users`));
  }
};

export const handleSignIn = async (req, res) => {
  try {
    const { username, password, refreshToken } = req.body;
    const data = await signIn({ username, password, refreshToken });

    return res.status(200).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error signing in"));
  }
};

export const handleSignOut = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { userId } = req.user;

    const data = await signOut({ userId, refreshToken });

    return res.status(200).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error signing out"));
  }
};

export const generateTokensHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const data = await generateTokens({ refreshToken });

    return res.status(200).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res
      .status(500)
      .json(formatErrorResponse("Problem generating tokens"));
  }
};

export const handleUpdateUser = async (req, res) => {
  try {
    const { userId, email, fullName, role, password } = req.body;

    const data = await patchUser({ userId, email, fullName, role, password });

    return res.status(200).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error updating user"));
  }
};

export const handleGetMe = async (req, res) => {
  try {
    const { userId } = req.user;
    const data = await getMe({ userId });

    return res.status(200).json({ data });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error getting user"));
  }
};

import { getUsers, createUser, deleteUser } from "./services.js";
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
    const { email, fullName, role } = req.body;

    const data = await createUser({ email, fullName, role });

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

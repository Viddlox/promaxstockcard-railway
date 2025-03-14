import {
  HttpError,
  formatResponse,
  formatErrorResponse,
} from "../../utils/http.js";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomers,
} from "./services.js";

export const handleGetCustomers = async (req, res) => {
  try {
    const { limit, cursor, search } = req.query;

    const { data, nextCursor, total, hasNextPage } = await getCustomers({
      limit,
      cursor,
      search,
    });

    res
      .status(200)
      .json(formatResponse(data, nextCursor, { total, hasNextPage }));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error getting customers"));
  }
};

export const handleCreateCustomer = async (req, res) => {
  try {
    const { companyName, address, phoneNumber, ssmNumber, postCode, email } =
      req.body;

    const customer = await createCustomer({
      companyName,
      address,
      phoneNumber,
      ssmNumber,
      postCode,
      email,
    });

    return res.status(201).json(formatResponse(customer));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error creating customer"));
  }
};

export const handleUpdateCustomer = async (req, res) => {
  try {
    const {
      customerId,
      companyName,
      address,
      phoneNumber,
      ssmNumber,
      postCode,
      email,
    } = req.body;

    const customer = await updateCustomer({
      customerId,
      companyName,
      address,
      phoneNumber,
      ssmNumber,
      postCode,
      email,
    });

    return res.status(200).json(formatResponse(customer));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res.status(500).json(formatErrorResponse("Error updating customer"));
  }
};

export const handleDeleteCustomers = async (req, res) => {
  try {
    const { customerIds } = req.body;

    await deleteCustomers({ customerIds });

    return res
      .status(200)
      .json(formatResponse({ message: "Customers deleted successfully" }));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.status).json(formatErrorResponse(e.message));
    }
    return res
      .status(500)
      .json(formatErrorResponse("Error deleting customers"));
  }
};

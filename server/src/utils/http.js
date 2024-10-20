export class HttpError extends Error {
  constructor(status, message, data = undefined) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const formatResponse = (data, nextCursor, extraParams = {}) => {
  // If nextCursor is undefined, return data without nextCursor
  if (nextCursor === undefined) {
    return {
      data,
      ...extraParams,
    };
  }

  return {
    data,
    nextCursor,
    ...extraParams,
  };
};

export const formatErrorResponse = (error, extraParams = {}) => ({
  error,
  data: null,
  ...extraParams,
});

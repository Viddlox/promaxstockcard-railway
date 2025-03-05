export const getLimitAndCursor = ({ limit, cursor }) => {
  const defaultLimit = 10;
  const defaultCursor = null;

  const limitQuery = Number.isNaN(Number(limit)) ? defaultLimit : Number(limit);
  const cursorQuery = cursor ? cursor : defaultCursor;

  return { limitQuery, cursorQuery };
};

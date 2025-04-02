export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const formattedDateTime = date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return formattedDateTime;
};

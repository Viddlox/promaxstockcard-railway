export const formatTimeStamp = (timestamp = "") => {
	const date = new Date(timestamp);
  
	return date.toLocaleDateString("en-US", {
	  year: "2-digit",
	  month: "2-digit",
	  day: "2-digit",
	  hour: "numeric",
	  minute: "numeric",
	  second: "numeric"
	});
  };
  
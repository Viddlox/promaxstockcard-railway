/**
 * Creates an update object containing only the fields that have changed
 * @param {Object} existingRecord - The current record from the database
 * @param {Object} newValues - The new values to be applied
 * @returns {Object} An object containing only the changed fields
 */
export const getChangedFields = (existingRecord, newValues) => {
  return Object.entries(newValues).reduce((changes, [key, value]) => {
    if (value !== undefined && value !== existingRecord[key]) {
      changes[key] = value;
    }
    return changes;
  }, {});
};

/**
 * Generates a human-readable summary of changes for notifications
 * @param {Array} changes - Array of change objects with field, oldValue, newValue, displayName
 * @param {string} partName - Name of the part being updated
 * @returns {string} - A formatted summary of changes
 */
export const generateChangeSummary = (changes, partName) => {
  if (!changes.length) return `Part ${partName} has been updated`;

  // Create a readable summary based on the number of changes
  if (changes.length === 1) {
    const change = changes[0];

    // Handle quantity changes with special formatting
    if (change.field === "partQuantity") {
      const direction =
        Number(change.newValue) > Number(change.oldValue)
          ? "increased"
          : "decreased";
      const diff = Math.abs(Number(change.newValue) - Number(change.oldValue));
      return `${partName}'s quantity ${direction} by ${diff} units (from ${change.oldValue} to ${change.newValue})`;
    }

    // Handle price changes with special formatting
    if (change.field === "partPrice") {
      return `${partName}'s price changed from RM${Number(
        change.oldValue
      ).toFixed(2)} to RM${Number(change.newValue).toFixed(2)}`;
    }

    // Default formatting for other fields
    return `${partName}'s ${change.displayName.toLowerCase()} changed from "${
      change.oldValue
    }" to "${change.newValue}"`;
  } else if (changes.length === 2) {
    // For two changes, list both specifically
    const fieldNames = changes
      .map((c) => c.displayName.toLowerCase())
      .join(" and ");
    return `${partName}'s ${fieldNames} have been updated`;
  } else {
    // For more than two changes, summarize the number
    return `${partName} has been updated with changes to ${changes.length} fields`;
  }
};

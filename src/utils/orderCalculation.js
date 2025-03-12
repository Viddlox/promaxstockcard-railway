export const calculateTotalCost = (bomChanges, partMap) => {
  return bomChanges.reduce((sum, change) => {
    const price = partMap[change.partId] || 0;
    const cost = price * change.partQuantity;

    return change.changeType === "addition" ? sum + cost : sum - cost;
  }, 0);
};

export const sumBomChanges = (backendBom, orderBom) => {
  const orderBomMap = Object.fromEntries(
    orderBom.map((part) => [part.partId, part.quantity])
  );

  const bomChanges = [];

  backendBom.forEach((backendBomPart) => {
    const orderQuantity = orderBomMap[backendBomPart.partId];

    if (orderQuantity == null) {
      bomChanges.push({
        partId: backendBomPart.partId,
        partQuantity: backendBomPart.quantity,
        changeType: "removal",
      });
    }
    else if (orderQuantity < backendBomPart.quantity) {
      bomChanges.push({
        partId: backendBomPart.partId,
        partQuantity: backendBomPart.quantity - orderQuantity,
        changeType: "removal",
      });
    }
    else if (orderQuantity > backendBomPart.quantity) {
      bomChanges.push({
        partId: backendBomPart.partId,
        partQuantity: orderQuantity - backendBomPart.quantity,
        changeType: "addition",
      });
    }
  });

  return bomChanges;
};

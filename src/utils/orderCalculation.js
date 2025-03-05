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

export const determineSetType = (aggregatedItems, parsedOrderItems, productMap) => {
  let setType = "ABC";

  const hasMultipleProducts = Object.keys(aggregatedItems.products).length > 1;
  const hasDuplicateProducts = Object.values(aggregatedItems.products).some(quantity => quantity > 1);
  
  // Check if any product has a modified BOM
  const hasModifiedProductBOM = parsedOrderItems.some(item => {
    const { productId, bom: orderBom } = item;
    
    if (productId && productMap[productId]) {
      const backendBom = productMap[productId].bom || [];
      const bomChanges = sumBomChanges(backendBom, orderBom || []);
      
      return bomChanges.length > 0;  // If BOM changes exist, it's modified
    }

    return false;
  });

  // Decide setType based on products and parts
  if (hasMultipleProducts || hasDuplicateProducts || aggregatedItems.partsOnly) {
    setType = "C";
  } else if (hasModifiedProductBOM) {
    setType = "A";
  }

  return setType;
};

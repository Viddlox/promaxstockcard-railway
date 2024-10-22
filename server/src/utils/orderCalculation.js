
export const calculateTotalCost = (bomChanges, partMap) => {
  return bomChanges.reduce((sum, num) => {
    const price = partMap[num.partId] || 0;
    return sum + price * num.partQuantity;
  }, 0);
};

export const sumBomChanges = (backendBom, orderBom) => {
  const backendBomMap = Object.fromEntries(
    backendBom.map((part) => [part.partId, part])
  );

  return orderBom
    .filter((orderBomPart) => {
      const backendBomPart = backendBomMap[orderBomPart.partId];
      return (
        !backendBomPart || orderBomPart.quantity !== backendBomPart.quantity
      );
    })
    .map((orderBomPart) => ({
      partId: orderBomPart.partId,
      partQuantity: orderBomPart.quantity,
    }));
};

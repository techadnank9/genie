export function getCheapestOption(results) {
  const pricedResults = results.filter(
    (result) => result.status === "completed" && Number.isFinite(result.price),
  );

  if (pricedResults.length === 0) {
    return null;
  }

  return pricedResults.reduce((cheapest, current) => {
    if (!cheapest || current.price < cheapest.price) {
      return current;
    }

    return cheapest;
  }, null);
}

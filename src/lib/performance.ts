export function estimateDashboardLoadTime(assetBytes: number, connectionKbps: number): number {
  if (assetBytes <= 0 || connectionKbps <= 0) {
    return 0;
  }

  const bits = assetBytes * 8;
  return Number((bits / (connectionKbps * 1000)).toFixed(2));
}

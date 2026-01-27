export function areAllIdsMatching(arr1: any, arr2: any) {
  // Create frequency maps for both arrays
  const createFrequencyMap1 = (arr: any) => {
    const map = new Map();
    arr.forEach((id: any) => {
      map.set(id.productId, (map.get(id) || 0) + 1);
    });
    return map;
  };
  const createFrequencyMap2 = (arr: any) => {
    const map = new Map();
    arr.forEach((id: any) => {
      map.set(id, (map.get(id) || 0) + 1);
    });
    return map;
  };
  
  const freq1 = createFrequencyMap1(arr1);
  const freq2 = createFrequencyMap2(arr2);
  
  // Check if maps have the same size
  if (freq1.size !== freq2.size) {
    return false;
  }
  
  // Compare each entry
  for (const [id, count] of freq1) {
    if (freq2.get(id) !== count) {
      return false;
    }
  }
  
  return true;
}
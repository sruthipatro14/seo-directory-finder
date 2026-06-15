/**
 * Concurrently maps a function over an array with a specified concurrency limit.
 *
 * @param items The array of items to process.
 * @param concurrencyLimit The maximum number of items to process concurrently.
 * @param fn The async function to apply to each item.
 * @returns A promise that resolves to an array of results.
 */
export async function mapConcurrent<T, R>(
  items: T[],
  concurrencyLimit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;
  const workers = Array.from({ length: Math.min(concurrencyLimit, items.length) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
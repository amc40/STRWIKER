export function mapRecordValues<T, U>(
  record: Record<string, T>,
  transform: (value: T) => U,
): Record<string, U> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, transform(value)]),
  );
}

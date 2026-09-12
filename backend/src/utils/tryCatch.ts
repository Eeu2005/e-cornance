export async function TryCatch<T>(
  fn: Promise<T>,
): Promise<[Error, null] | [null, T]> {
  try {
    const res = await fn;
    return [null, res];
  } catch (error) {
    return [error as Error, null];
  }
}

export default function getErrorCode(err: Error) {
  try {
    if ('code' in err && typeof err.code === 'string') {
      return err.code;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

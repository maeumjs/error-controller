import type { TMaeumEncryptor } from '#modules/interfaces/MaeumFunctions';

export default function getErrorCode(
  err: Error,
  defaultCode?: string,
  encryptor?: TMaeumEncryptor,
) {
  try {
    if ('code' in err && typeof err.code === 'string') {
      return encryptor != null ? encryptor(err.code) : err.code;
    }

    if (defaultCode != null) {
      return encryptor != null ? encryptor(defaultCode) : defaultCode;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

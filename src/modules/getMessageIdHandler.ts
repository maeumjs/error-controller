import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from 'src/modules/interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';
import type { TMaeumGetMessageId } from 'src/modules/interfaces/MaeumFunctions';
import type TMaeumMessageIdHandles from 'src/modules/interfaces/TMaeumMessageIdHandles';

export default function getMessageIdHandler(
  messages: TMaeumMessageIdHandles | undefined,
  handlerId: string,
): TMaeumGetMessageId {
  try {
    const handler = messages?.[handlerId];

    if (handler != null) {
      return handler;
    }

    const common = messages?.[CE_MAEUM_DEFAULT_ERROR_HANDLER.COMMON];

    if (common != null) {
      return common;
    }

    return (id: string) => id;
  } catch {
    return (id: string) => id;
  }
}

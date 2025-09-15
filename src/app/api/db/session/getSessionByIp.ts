import { nocoClient } from '../nocoClient'
import { SessionResponseDataType } from "@/app/types/Session";

type countResponseType = {
  list: SessionResponseDataType[];
}

export async function getSessionByIp(ip: string) {
  try {
    const data = await nocoClient.listRecords<SessionResponseDataType>('mnsb472ewctetv1', {
      where: `(ip,eq,${ip})`,
      limit: 200,
      shuffle: 0,
      offset: 0,
    });

    const list = data.list as SessionResponseDataType[];

    if (list.length === 0) {
      throw new Error('Session not found');
    }

    if (list[0]?.Id === undefined) {
      throw new Error('Session not found');
    }

    const sessionId = list[0]?.Id;

    return {
      sessionId
    };

  } catch (error) {
    console.error('Error checking existing session by IP:', error);
    throw error;
  }
}
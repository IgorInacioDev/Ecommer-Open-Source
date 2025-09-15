import { nocoClient } from '../nocoClient'
import { SessionResponseDataType } from "@/app/types/Session";

type SessionResponseType = {
  list: SessionResponseDataType[];
}

export async function getFullSessionByIp(ip: string): Promise<SessionResponseDataType | null> {
  try {
    const data = await nocoClient.listRecords<SessionResponseDataType>('mnsb472ewctetv1', {
      where: `(ip,eq,${ip})`,
      limit: 200,
      shuffle: 0,
      offset: 0,
    });

    const list = data.list as SessionResponseDataType[];

    if (list.length === 0) {
      return null;
    }

    return list[0];

  } catch (error) {
    console.error('Error getting full session by IP:', error);
    throw error;
  }
}
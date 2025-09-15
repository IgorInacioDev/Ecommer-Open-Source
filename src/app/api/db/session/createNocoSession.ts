import { SessionCreateDataType, SessionResponseType } from "@/app/types/Session";
import { checkExistingSessionByIP } from "./checkExistingSessionByIP";
import { nocoClient } from '../nocoClient'

export async function createNocoSession(sessionData: SessionCreateDataType) {
  try {
    const { count } = await checkExistingSessionByIP(sessionData.ip);
    if (count > 0) {
      throw new Error('Session already exists');
    }

    const { list, pageInfo } = await nocoClient.postJson<SessionResponseType>(
      `/api/v2/tables/mnsb472ewctetv1/records`,
      sessionData
    );

    return {
      list,
      pageInfo
    };

  } catch (error) {
    console.error('Error creating noco session');
    throw error;
  }
}
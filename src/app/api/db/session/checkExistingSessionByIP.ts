import { nocoClient } from '../nocoClient'

type countResponseType = {
  count: number;
}

export async function checkExistingSessionByIP(ip: string) {
  try {
    const url = `${nocoClient.baseUrl}/api/v2/tables/mnsb472ewctetv1/records/count?where=${encodeURIComponent(`(ip,eq,${ip})`)}&limit=105&shuffle=0&offset=0`;

    const { count }: countResponseType = await nocoClient.getJsonAbsolute<countResponseType>(url);

    return {
      count,
    };
  } catch (error) {
    console.error('Error checking existing session by IP:', error);
    throw error;
  }
}
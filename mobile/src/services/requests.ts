import axios from 'axios';
import api from './api';

export interface RequestAttachmentRecord {
  url: string;
  publicId: string;
}

export interface LocalRequestAttachment {
  uri: string;
  name: string;
  mimeType?: string;
}

export interface CreateCitizenRequestPayload {
  fullName: string;
  email: string;
  phone: string;
  requestType: string;
  type?: string;
  details: string;
  userId?: string;
  attachments?: LocalRequestAttachment[];
}

export interface CitizenRequestRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  requestType: string;
  type?: string;
  details: string;
  userId?: string;
  status:
    | '\u0448\u0438\u0439\u0434\u0432\u044d\u0440\u043b\u044d\u0441\u044d\u043d'
    | '\u0445\u044f\u043d\u0430\u0433\u0434\u0430\u0436 \u0431\u0443\u0439'
    | '\u0445\u0430\u0440\u0438\u0443 \u04e9\u0433\u0441\u04e9\u043d'
    | '\u0445\u0443\u0432\u0430\u0430\u0440\u043b\u0430\u0433\u0434\u0430\u0430\u0433\u04af\u0439'
    | 'pending'
    | 'in_review'
    | 'resolved';
  attachments: RequestAttachmentRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCitizenRequestResponse {
  request: CitizenRequestRecord;
}

export interface ListCitizenRequestsResponse {
  requests: CitizenRequestRecord[];
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
  percent: number;
}

export interface HomeStatsResponse {
  totalRequests: number;
  resolvedRequests: number;
  inReviewRequests: number;
  respondedPercent: number;
  statusBreakdown: StatusBreakdownItem[];
}

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Network Error: backend is unreachable. Start server and set EXPO_PUBLIC_API_URL to your PC IP (example: http://192.168.1.10:3000).';
    }

    const responseError =
      (
        error.response?.data as
          | { message?: string | string[]; error?: string }
          | undefined
      )?.message ||
      (
        error.response?.data as
          | { message?: string | string[]; error?: string }
          | undefined
      )?.error;

    if (Array.isArray(responseError)) {
      return responseError.join('\n');
    }

    if (responseError) return responseError;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const toSafeMimeType = (name: string, mimeType?: string): string => {
  const normalized = (mimeType || '').trim().toLowerCase();
  if (
    normalized === 'image/png' ||
    normalized === 'image/jpeg' ||
    normalized === 'application/pdf'
  ) {
    return normalized;
  }

  const fileName = name.toLowerCase();
  if (fileName.endsWith('.png')) return 'image/png';
  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  return 'application/pdf';
};

export const createCitizenRequest = async (
  payload: CreateCitizenRequestPayload,
): Promise<CreateCitizenRequestResponse> => {
  try {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    formData.append('email', payload.email);
    formData.append('phone', payload.phone);
    formData.append('requestType', payload.requestType);
    formData.append('type', payload.type || payload.requestType);
    formData.append('details', payload.details);

    if (payload.userId?.trim()) {
      formData.append('userId', payload.userId.trim());
    }

    (payload.attachments || []).forEach((attachment) => {
      const file = {
        name: attachment.name,
        type: toSafeMimeType(attachment.name, attachment.mimeType),
        uri: attachment.uri,
      } as unknown as Blob;
      formData.append('attachments', file);
    });

    const response = await api.post<CreateCitizenRequestResponse>(
      '/api/requests',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, 'Request submission failed'));
  }
};

export const getCitizenRequests = async (
  userId?: string,
): Promise<ListCitizenRequestsResponse> => {
  try {
    const response = await api.get<ListCitizenRequestsResponse>('/api/requests', {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, 'Unable to load requests'));
  }
};

export const getHomeStats = async (): Promise<HomeStatsResponse> => {
  try {
    const response = await api.get<HomeStatsResponse>('/api/stats');
    return response.data;
  } catch (error) {
    throw new Error(toErrorMessage(error, 'Unable to load stats'));
  }
};

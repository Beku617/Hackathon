import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Model } from 'mongoose';
import {
  CitizenRequest,
  CitizenRequestDocument,
  RequestStatus,
} from './schemas/request.schema';

const RESOLVED_STATUS: RequestStatus = '\u0448\u0438\u0439\u0434\u0432\u044d\u0440\u043b\u044d\u0441\u044d\u043d';
const IN_REVIEW_STATUS: RequestStatus = '\u0445\u044f\u043d\u0430\u0433\u0434\u0430\u0436 \u0431\u0443\u0439';
const RESPONDED_STATUS: RequestStatus = '\u0445\u0430\u0440\u0438\u0443 \u04e9\u0433\u0441\u04e9\u043d';

const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
]);
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

export interface PublicAttachment {
  url: string;
  publicId: string;
}

export interface PublicCitizenRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  requestType: string;
  type: string;
  details: string;
  userId?: string;
  status: RequestStatus;
  attachments: PublicAttachment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequestResponse {
  request: PublicCitizenRequest;
}

export interface ListRequestsResponse {
  requests: PublicCitizenRequest[];
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
  percent: number;
}

export interface RequestStatsResponse {
  totalRequests: number;
  resolvedRequests: number;
  inReviewRequests: number;
  respondedPercent: number;
  statusBreakdown: StatusBreakdownItem[];
}

type StatusAggregateRow = {
  _id: string;
  count: number;
};

type UploadedAttachmentFile = {
  buffer?: Buffer;
  mimetype?: string;
  originalname?: string;
  size?: number;
};

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(CitizenRequest.name)
    private readonly requestModel: Model<CitizenRequestDocument>,
  ) {}

  async create(
    payload: Record<string, unknown>,
    uploadedFiles: unknown[] = [],
  ): Promise<CreateRequestResponse> {
    const fullName = this.normalizeText(payload.fullName);
    const email = this.normalizeEmail(payload.email);
    const phone = this.normalizePhone(payload.phone);
    const requestType = this.normalizeText(payload.requestType || payload.type);
    const details = this.normalizeText(payload.details);
    const userId = this.normalizeOptionalText(payload.userId);

    if (!fullName || fullName.length < 2 || fullName.length > 60) {
      throw new BadRequestException('Full name must be 2-60 chars');
    }

    if (!email || !this.isValidEmail(email)) {
      throw new BadRequestException('Provide a valid email');
    }

    if (!phone || !/^\d{8,15}$/.test(phone)) {
      throw new BadRequestException('Phone must contain 8-15 digits');
    }

    if (!requestType || requestType.length > 120) {
      throw new BadRequestException(
        'Request type is required and must be up to 120 chars',
      );
    }

    if (!details || details.length > 4000) {
      throw new BadRequestException(
        'Details are required and must be up to 4000 chars',
      );
    }

    const files = this.normalizeUploadedFiles(uploadedFiles);
    this.validateAttachments(files);
    const attachments = await this.uploadAttachmentsToCloudinary(files);

    const request = await this.requestModel.create({
      fullName,
      email,
      phone,
      requestType,
      type: requestType,
      details,
      userId,
      attachments,
    });

    return { request: this.toPublicRequest(request) };
  }

  async list(userId?: string): Promise<ListRequestsResponse> {
    const normalizedUserId = this.normalizeOptionalText(userId);
    const filter = normalizedUserId ? { userId: normalizedUserId } : {};
    const requests = await this.requestModel.find(filter).sort({ createdAt: -1 });

    return {
      requests: requests.map((request) => this.toPublicRequest(request)),
    };
  }

  async getStats(lastDays = 30): Promise<RequestStatsResponse> {
    const since = new Date();
    since.setDate(since.getDate() - lastDays);

    const dateFilter = { createdAt: { $gte: since } };

    const [
      totalRequests,
      resolvedRequests,
      inReviewRequests,
      respondedRequests,
      statusRows,
    ] = await Promise.all([
      this.requestModel.countDocuments(dateFilter),
      this.requestModel.countDocuments({
        ...dateFilter,
        status: RESOLVED_STATUS,
      }),
      this.requestModel.countDocuments({
        ...dateFilter,
        status: IN_REVIEW_STATUS,
      }),
      this.requestModel.countDocuments({
        ...dateFilter,
        status: RESPONDED_STATUS,
      }),
      this.requestModel.aggregate<StatusAggregateRow>([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const statusBreakdown = statusRows.map((row) => ({
      status: row._id,
      count: row.count,
      percent:
        totalRequests > 0
          ? this.roundToOneDecimal((row.count / totalRequests) * 100)
          : 0,
    }));

    return {
      totalRequests,
      resolvedRequests,
      inReviewRequests,
      respondedPercent:
        totalRequests > 0
          ? this.roundToOneDecimal((respondedRequests / totalRequests) * 100)
          : 0,
      statusBreakdown,
    };
  }

  private normalizeUploadedFiles(files: unknown[]): UploadedAttachmentFile[] {
    return files.filter((file): file is UploadedAttachmentFile => Boolean(file));
  }

  private validateAttachments(files: UploadedAttachmentFile[]): void {
    files.forEach((file, index) => {
      const mimeType = (file.mimetype || '').trim().toLowerCase();
      if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(mimeType)) {
        throw new BadRequestException(
          `Unsupported file type at attachment #${index + 1}. Only PNG, JPG, PDF are allowed.`,
        );
      }

      const size = Number(file.size || 0);
      if (size <= 0) {
        throw new BadRequestException(
          `Invalid file size at attachment #${index + 1}.`,
        );
      }

      if (size > MAX_ATTACHMENT_SIZE_BYTES) {
        throw new BadRequestException(
          `Attachment #${index + 1} exceeds 10MB limit.`,
        );
      }

      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException(
          `Attachment #${index + 1} could not be read.`,
        );
      }
    });
  }

  private async uploadAttachmentsToCloudinary(
    files: UploadedAttachmentFile[],
  ): Promise<PublicAttachment[]> {
    if (!files.length) {
      return [];
    }

    const cloudName = this.readRequiredEnv('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.readRequiredEnv('CLOUDINARY_API_KEY');
    const apiSecret = this.readRequiredEnv('CLOUDINARY_API_SECRET');

    cloudinary.config({
      api_key: apiKey,
      api_secret: apiSecret,
      cloud_name: cloudName,
      secure: true,
    });

    const timestamp = Date.now();

    return Promise.all(
      files.map((file, index) =>
        this.uploadSingleAttachment(file, `${timestamp}-${index}`),
      ),
    );
  }

  private uploadSingleAttachment(
    file: UploadedAttachmentFile,
    uniqueSuffix: string,
  ): Promise<PublicAttachment> {
    const baseName = this.sanitizeBaseName(file.originalname, uniqueSuffix);
    const folder = 'citizen-requests';

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          filename_override: file.originalname,
          folder,
          public_id: baseName,
          resource_type: 'auto',
          use_filename: false,
        },
        (error, result) => {
          if (error) {
            reject(
              new InternalServerErrorException(
                `Cloudinary upload failed: ${error.message}`,
              ),
            );
            return;
          }

          if (!result?.secure_url || !result.public_id) {
            reject(
              new InternalServerErrorException(
                'Cloudinary upload did not return file URL.',
              ),
            );
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });
  }

  private sanitizeBaseName(fileName: string | undefined, fallback: string): string {
    const normalized = String(fileName || '')
      .replace(/\.[^/.]+$/, '')
      .trim()
      .toLowerCase();

    const cleaned = normalized
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return cleaned ? `${cleaned}-${fallback}` : `attachment-${fallback}`;
  }

  private readRequiredEnv(key: string): string {
    const value = process.env[key]?.trim();
    if (!value) {
      throw new InternalServerErrorException(
        `Server environment variable ${key} is not set`,
      );
    }

    return value;
  }

  private normalizeText(value: unknown): string {
    return String(value ?? '').trim();
  }

  private normalizeOptionalText(value: unknown): string | undefined {
    const normalized = String(value ?? '').trim();
    return normalized || undefined;
  }

  private normalizeEmail(value: unknown): string {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }

  private normalizePhone(value: unknown): string {
    return String(value ?? '')
      .replace(/\D/g, '')
      .trim();
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private roundToOneDecimal(value: number): number {
    return Math.round(value * 10) / 10;
  }

  private toPublicRequest(
    request: CitizenRequestDocument,
  ): PublicCitizenRequest {
    return {
      id: request._id.toString(),
      fullName: request.fullName,
      email: request.email,
      phone: request.phone,
      requestType: request.requestType,
      type: request.type || request.requestType,
      details: request.details,
      userId: request.userId,
      status: request.status,
      attachments: (request.attachments || []).map((attachment) => ({
        publicId: attachment.publicId,
        url: attachment.url,
      })),
      createdAt: request.createdAt?.toISOString(),
      updatedAt: request.updatedAt?.toISOString(),
    };
  }
}


import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  CreateRequestResponse,
  ListRequestsResponse,
  RequestStatsResponse,
  RequestsService,
} from './requests.service';

@Controller('api')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('requests')
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  create(
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files: unknown[] = [],
  ): Promise<CreateRequestResponse> {
    return this.requestsService.create(body, files);
  }

  @Get('requests')
  list(@Query('userId') userId?: string): Promise<ListRequestsResponse> {
    return this.requestsService.list(userId);
  }

  @Get('stats')
  getStats(): Promise<RequestStatsResponse> {
    return this.requestsService.getStats(30);
  }
}

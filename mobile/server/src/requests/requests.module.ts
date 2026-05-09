import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { CitizenRequest, CitizenRequestSchema } from './schemas/request.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CitizenRequest.name, schema: CitizenRequestSchema }])],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}

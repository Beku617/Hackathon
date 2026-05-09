import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CitizenRequestDocument = HydratedDocument<CitizenRequest>;

export const REQUEST_STATUSES = [
  '\u0448\u0438\u0439\u0434\u0432\u044d\u0440\u043b\u044d\u0441\u044d\u043d',
  '\u0445\u044f\u043d\u0430\u0433\u0434\u0430\u0436 \u0431\u0443\u0439',
  '\u0445\u0430\u0440\u0438\u0443 \u04e9\u0433\u0441\u04e9\u043d',
  '\u0445\u0443\u0432\u0430\u0430\u0440\u043b\u0430\u0433\u0434\u0430\u0430\u0433\u04af\u0439',
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

@Schema({ _id: false })
export class RequestAttachment {
  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ required: true, trim: true })
  publicId: string;
}

export const RequestAttachmentSchema =
  SchemaFactory.createForClass(RequestAttachment);

@Schema({ timestamps: true })
export class CitizenRequest {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 60 })
  fullName: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true, minlength: 8, maxlength: 15 })
  phone: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 120 })
  requestType: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 120 })
  type: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 4000 })
  details: string;

  @Prop({ required: false, trim: true })
  userId?: string;

  @Prop({
    enum: REQUEST_STATUSES,
    default: '\u0445\u0443\u0432\u0430\u0430\u0440\u043b\u0430\u0433\u0434\u0430\u0430\u0433\u04af\u0439',
  })
  status: RequestStatus;

  @Prop({ type: [RequestAttachmentSchema], default: [] })
  attachments: RequestAttachment[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const CitizenRequestSchema =
  SchemaFactory.createForClass(CitizenRequest);

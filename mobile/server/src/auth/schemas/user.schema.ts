import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 60 })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  })
  username: string;

  @Prop({ required: true, trim: true, minlength: 8, maxlength: 15 })
  phone: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';
}

export const UserSchema = SchemaFactory.createForClass(User);

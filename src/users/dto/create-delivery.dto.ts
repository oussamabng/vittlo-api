import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateDeliveryDto {
  @IsEmail()
  @Field(() => String)
  email: string;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  password: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  licensePlate: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  phoneNumber: string;

  adress?: string;
  dateOfBirth?: Date;
  carModel?: string;
  carColor?: string;
}

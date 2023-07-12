import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class OptimalRouteDto {
  @IsNotEmpty()
  @Field(() => Number)
  lat: number;

  @IsNotEmpty()
  @Field(() => Number)
  lon: number;

  @IsNotEmpty()
  @IsString()
  @Field(() => String)
  adr: string;
}

@InputType()
export class CreateMissionDto {
  @Field(() => [Int])
  @IsNotEmpty()
  orders: number[];
}

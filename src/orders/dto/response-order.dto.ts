import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';

@ObjectType()
export class ResponseOrderDto {
  @Field(() => [Order], { nullable: true })
  items: Order[];

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => Int, { nullable: true })
  currentPage: number;

  @Field(() => Int, { nullable: true })
  totalPages: number;

  @Field(() => Boolean, { nullable: true })
  hasNextPage: boolean;
}

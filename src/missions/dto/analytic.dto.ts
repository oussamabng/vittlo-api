import { ObjectType, Field, Int, Float, Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';

@Scalar('WilayaType', () => [String, Int])
export class WilayaType {
  description = 'Custom scalar type for wilayas';

  parseValue(value: [string, number]): [string, number] {
    return value; // Input value is an array of [string, number]
  }

  serialize(value: [string, number]): [string, number] {
    return value; // Output value is an array of [string, number]
  }

  parseLiteral(ast: any): [string, number] | null {
    if (ast.kind === Kind.LIST) {
      const [name, count] = ast.values.map((value: any) => value.value);
      return [name, count];
    }
    return null;
  }
}

@ObjectType()
export class AnalyticsData {
  @Field(() => Int)
  totalDeliveryFees: number;

  @Field(() => Int)
  usersDeliveryCount: number;

  @Field(() => WilayaType)
  wilayas: WilayaType;

  @Field(() => [WeekData])
  weeksOrders: WeekData[];

  @Field(() => [WeekData])
  weeksMissions: WeekData[];
}

@ObjectType()
export class WeekData {
  @Field(() => Int)
  week: number;

  @Field(() => Int)
  orderCount: number;
}

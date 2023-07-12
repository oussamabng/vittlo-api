import { InputType, Field, Float } from '@nestjs/graphql';
import { DeliveryFees } from 'src/orders/enums/delivery-fees.enum';

@InputType()
export class CreateOrderDto {
  @Field(() => String)
  productName: string;

  @Field(() => Float)
  productPrice: number;

  @Field(() => String)
  shippingAddress: string;

  @Field(() => Float)
  destinationLat: string;

  @Field(() => String)
  senderFullName: string;

  @Field(() => String)
  senderPhoneNumber: string;

  @Field(() => Float)
  destinationLong: string;

  @Field(() => DeliveryFees)
  deliveryFees: DeliveryFees;
}

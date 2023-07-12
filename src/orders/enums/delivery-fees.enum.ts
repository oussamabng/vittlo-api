export enum DeliveryFees {
  SHORT_DISTANCE = 'SHORT_DISTANCE', //If the distance is less than 100 kilometers.
  MEDIUM_DISTANCE = 'MEDIUM_DISTANCE', // If the distance is between 100 and 500 kilometers
  LONG_DISTANCE = 'LONG_DISTANCE', // If the distance is between 500 and 1500 kilometers.
  EXPRESS = 'EXPRESS', //If the distance is greater than 1500 kilometers
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Mission } from './entities/mission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import { MissionStatus } from './enums/mission-status.enum';
import { Tracking } from 'src/tracking/entities/tracking.entity';
import { TrackingType } from 'src/tracking/enums/tracking-type.enum';
import { TrackingStatus } from 'src/tracking/enums/tracking-status.enum';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { SearchDto } from 'src/users/dto/search-dto';
import { User } from 'src/users/entities/user.entity';
import { UserStatus } from 'src/users/enums/user-status.dto';
import { UserRole } from 'src/users/enums/user-role.dto';
import { In } from 'typeorm';

const wilayas = [
  {
    name: 'Adrar',
    wilayaNumber: 1,
    lat: 27.875179,
    long: -0.29572,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Chlef',
    wilayaNumber: 2,
    lat: 36.166088,
    long: 1.33085,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Laghouat',
    wilayaNumber: 3,
    lat: 33.800129,
    long: 2.86971,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Oum el Bouaghi',
    wilayaNumber: 4,
    lat: 35.876549,
    long: 7.11539,
    deliveryFees: 'SHORT_DISTANCE',
  },
  {
    name: 'Batna',
    wilayaNumber: 5,
    lat: 35.55597,
    long: 6.17414,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Béjaïa',
    wilayaNumber: 6,
    lat: 36.75587,
    long: 5.08433,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Biskra',
    wilayaNumber: 7,
    lat: 34.85038,
    long: 5.72805,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Béchar',
    wilayaNumber: 8,
    lat: 31.61667,
    long: 2.21667,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Blida',
    wilayaNumber: 9,
    lat: 36.47004,
    long: 2.8277,
    deliveryFees: 'SHORT_DISTANCE',
  },
  {
    name: 'Bouira',
    wilayaNumber: 10,
    lat: 36.2835299,
    long: 3.9878427,
    deliveryFees: 'SHORT_DISTANCE',
  },
  {
    name: 'Tamanrasset',
    wilayaNumber: 11,
    lat: 21.953729,
    long: 5.561728,
    deliveryFees: 'EXPRESS',
  },
  {
    name: 'Tébessa',
    wilayaNumber: 12,
    lat: 35.4,
    long: 8.116667,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Tlemcen',
    wilayaNumber: 13,
    lat: 34.8884062,
    long: -1.3180042,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Tiaret',
    wilayaNumber: 14,
    lat: 35.3702137352521,
    long: 1.3206655084001984,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Tizi Ouzou',
    wilayaNumber: 15,
    lat: 36.713909180824224,
    long: 4.048664832441479,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  /*  {
      name: "Alger",
      wilayaNumber: 16,
      lat: 36.73560323832883,
      long: 3.091282328554248,
      deliveryFees: "SHORT_DISTANCE",
    }, */
  {
    name: 'Djelfa',
    wilayaNumber: 17,
    lat: 34.67171548699047,
    long: 3.2483006084182118,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Jijel',
    wilayaNumber: 18,
    lat: 36.82187217573793,
    long: 5.764308692667515,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Sétif',
    wilayaNumber: 19,
    lat: 36.18921025176639,
    long: 5.412621305999559,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Saïda',
    wilayaNumber: 20,
    lat: 34.8436,
    long: 0.145,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Skikda',
    wilayaNumber: 21,
    lat: 34.838791295866926,
    long: 0.1462291295146741,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Sidi Bel Abbès',
    wilayaNumber: 22,
    lat: 35.21231741768364,
    long: -0.6268997608592823,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Annaba',
    wilayaNumber: 23,
    lat: 36.89636599293525,
    long: 7.747215679390861,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Guelma',
    wilayaNumber: 24,
    lat: 36.46414865463109,
    long: 7.433352963203343,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Constantine',
    wilayaNumber: 25,
    lat: 36.359944173994215,
    long: 6.6467869323690305,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Medea',
    wilayaNumber: 26,
    lat: 36.26312646311518,
    long: 2.756428873058771,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Mostaganem',
    wilayaNumber: 27,
    lat: 35.93004924412955,
    long: 0.09146289347865293,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Msila',
    wilayaNumber: 28,
    lat: 35.719837712714785,
    long: 4.526979856555737,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Mascara',
    wilayaNumber: 29,
    lat: 35.40204063936677,
    long: 0.1394765679795675,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Ouargla',
    wilayaNumber: 30,
    lat: 31.951728803977137,
    long: 5.324596837019669,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Oran',
    wilayaNumber: 31,
    lat: 35.698821589219094,
    long: -0.6388743383290479,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'El Bayadh',
    wilayaNumber: 32,
    lat: 33.685343154573076,
    long: 1.0277861187587163,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Illizi',
    wilayaNumber: 33,
    lat: 26.56029753259557,
    long: 8.511403188684376,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Bordj Bou Arréridj',
    wilayaNumber: 34,
    lat: 36.0733,
    long: 4.7639,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Boumerdes',
    wilayaNumber: 35,
    lat: 36.072413377177064,
    long: 4.764667107713109,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'El Tarf',
    wilayaNumber: 36,
    lat: 36.76855380762602,
    long: 8.319438824535528,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Tindouf',
    wilayaNumber: 37,
    lat: 27.798629056431793,
    long: -8.191676016867595,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Tissemsilt',
    wilayaNumber: 38,
    lat: 35.60502418558564,
    long: 1.8161805615012374,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'El Oued',
    wilayaNumber: 39,
    lat: 33.368768352590315,
    long: 6.851504668265453,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Khenchela',
    wilayaNumber: 40,
    lat: 35.427032890832635,
    long: 7.146823640378871,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Souk Ahras',
    wilayaNumber: 41,
    lat: 36.279209421667574,
    long: 7.940728572399742,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Tipaza',
    wilayaNumber: 42,
    lat: 36.589841121381234,
    long: 2.443033837523135,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Mila',
    wilayaNumber: 43,
    lat: 36.45241816119203,
    long: 6.259668766924073,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Aïn Defla',
    wilayaNumber: 44,
    lat: 36.254875714682086,
    long: 1.9611413112573657,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Naama',
    wilayaNumber: 45,
    lat: 33.26898466102498,
    long: -0.30878202421273193,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Ain Temouchent',
    wilayaNumber: 46,
    lat: 35.30299363896315,
    long: -1.1363180846036114,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Ghardaia',
    wilayaNumber: 47,
    lat: 32.495611485908746,
    long: 3.648432416036536,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Relizane',
    wilayaNumber: 48,
    lat: 35.7440327770804,
    long: 0.5559978743923824,
    deliveryFees: 'MEDIUM_DISTANCE',
  },
  {
    name: 'Timimoun',
    wilayaNumber: 49,
    lat: 29.3333,
    long: 0.25,
    deliveryFees: 'EXPRESS',
  },
  {
    name: 'Bordj Badji Mokhtar',
    wilayaNumber: 50,
    lat: 23.760643,
    long: -0.9056623,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Ouled Djellal',
    wilayaNumber: 51,
    lat: 34.4466834,
    long: 5.1015225,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Béni Abbès',
    wilayaNumber: 52,
    lat: 30.1325,
    long: -2.1671,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'In Salah',
    wilayaNumber: 53,
    lat: 27.1928,
    long: 2.4852,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'In Guezzam',
    wilayaNumber: 54,
    lat: 19.5709,
    long: 5.7694,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Touggourt',
    wilayaNumber: 55,
    lat: 33.1,
    long: 6.0667,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'Djanet',
    wilayaNumber: 56,
    lat: 24.5546,
    long: 9.4812,
    deliveryFees: 'EXPRESS',
  },
  {
    name: "El M'Ghair",
    wilayaNumber: 57,
    lat: 33.9506,
    long: 5.9242,
    deliveryFees: 'LONG_DISTANCE',
  },
  {
    name: 'El Meniaa',
    wilayaNumber: 58,
    lat: 30.5833,
    long: 2.8833,
    deliveryFees: 'LONG_DISTANCE',
  },
];

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission) private repo: Repository<Mission>,
    @InjectRepository(Tracking) private repoTracking: Repository<Tracking>,
    @InjectRepository(Order) private repoOrders: Repository<Order>,
    @InjectRepository(User) private repoUsers: Repository<User>,
  ) {}

  async create() {
    const mission = this.repo.create();
    await this.repo.save(mission);

    return mission;
  }

  async missions() {
    const missions = await this.repo.find({
      relations: ['delivery', 'orders', 'tracking'],
      where: {
        status: MissionStatus.PENDING,
        /*    tracking: {
          type: TrackingType.MISSION,
        }, */
      },
      order: {
        orders: {
          createdAt: 'ASC',
        },
        tracking: {
          createdAt: 'ASC',
        },
      },
    });

    return missions;
  }

  async findAll({ page, limit }: PaginationDto, { keyword }: SearchDto) {
    const skip = (page - 1) * limit;

    const [missions, totalCount] = await this.repo.findAndCount({
      skip,
      take: limit,
      /*    where: [
        {
          delivery: {
            email: Like(`%${keyword}%`),
          },
        },
      ], */
      relations: ['delivery', 'orders', 'tracking'],
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;

    return {
      items: missions,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} mission`;
  }

  async currentPositionMission(id: number) {
    const mission = await this.repo.findOne({
      where: { id },
    });

    if (!mission) {
      throw new BadRequestException('Mission not found');
    }

    const orders = await this.repoOrders.find({
      where: {
        mission: {
          id: mission?.id,
        },
        status: OrderStatus.OUT_FOR_DELIVERY,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return orders?.length > 0 ? orders[0] : null;
  }

  async moveToNextOrder(id: number) {
    const mission = await this.repo.findOne({
      where: { id },
      relations: ['delivery'],
    });

    if (!mission) {
      throw new BadRequestException('Mission not found');
    }

    if (mission.status === MissionStatus.COMPLETED) {
      return 'Mission already finished all orders';
    }

    const orders = await this.repoOrders.find({
      where: {
        mission: {
          id: mission?.id,
        },
        status: OrderStatus.OUT_FOR_DELIVERY,
      },
      order: {
        position: 'ASC',
      },
    });

    if (orders.length > 0) {
      const orderDone = orders[0];
      orderDone.status = OrderStatus.DELIVERED;
      this.repoOrders.save(orderDone);
      //add tracking order
      const tracking = this.repoTracking.create({
        type: TrackingType.ORDER,
        order: orderDone,
        status: TrackingStatus.DELIVERED,
        currentPlace: orderDone.shippingAddress,
      });
      await this.repoTracking.save(tracking);

      //add tracking mission
      const trackingMission = this.repoTracking.create({
        type: TrackingType.MISSION,
        mission: mission,
        status: TrackingStatus.IN_PROGRESS,
        currentPlace: orderDone.shippingAddress,
      });
      await this.repoTracking.save(trackingMission);
    } else {
      mission.status = MissionStatus.COMPLETED;
      this.repo.save(mission);

      //change status of user delivery
      const user = await this.repoUsers.findOne({
        where: { id: mission.delivery.id },
      });
      user.status = UserStatus.ACTIVE;
      this.repoUsers.save(user);

      //add tracking
      const tracking = this.repoTracking.create({
        type: TrackingType.MISSION,
        mission: mission,
        status: TrackingStatus.DELIVERED,
      });
      await this.repoTracking.save(tracking);
    }

    return 'Success';
  }

  async origin(userId: number) {
    const user = await this.repoUsers.findOne({ where: { id: userId } });

    const mission = await this.repo.findOne({
      relations: ['orders', 'delivery'],
      order: {
        createdAt: 'ASC',
        orders: { position: 'ASC' },
      },
      where: {
        delivery: {
          id: user?.id,
          status: UserStatus.IN_MISSION,
        },
        status: MissionStatus.IN_PROGRESS,
      },
    });

    const missionFinished = await this.missionHadFinishedOrders(userId);

    if (missionFinished) {
      return {
        latitude: mission?.orders[mission?.orders?.length - 1]?.destinationLat,
        longitude:
          mission?.orders[mission?.orders?.length - 1]?.destinationLong,
      };
    }

    const promises =
      mission?.orders?.map(async (order, index) => {
        if (order?.status === OrderStatus.OUT_FOR_DELIVERY) {
          //index == 1
          if (index === 0) {
            return {
              latitude: 36.7538,
              longitude: 3.0588,
            };
          } else {
            return {
              latitude: mission?.orders[index - 1]?.destinationLat,
              longitude: mission?.orders[index - 1]?.destinationLong,
            };
          }
        }
      }) || [];

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result) {
        return result;
      }
    }

    return {
      latitude: null,
      longitude: null,
    };
  }
  getDistanceValue(distance: string) {
    switch (distance) {
      case 'SHORT_DISTANCE':
        return 400;
      case 'MEDIUM_DISTANCE':
        return 500;
      case 'LONG_DISTANCE':
        return 650;
      case 'EXPRESS':
        return 750;
      default:
        return 0;
    }
  }

  async test() {
    const orders = await this.repoOrders.find({
      where: {
        status: OrderStatus.DELIVERED,
      },
    });

    // Define a map to store the order counts for each wilaya
    const wilayaOrderCounts = new Map<string, number>();

    // Iterate through the orders and count them for each wilaya
    orders.forEach((order) => {
      const { destinationLat, destinationLong } = order;
      const closestWilaya = findClosestWilaya(
        parseFloat(destinationLat),
        parseFloat(destinationLong),
      );

      // Increment the order count for the wilaya
      if (wilayaOrderCounts.has(closestWilaya.name)) {
        wilayaOrderCounts.set(
          closestWilaya.name,
          wilayaOrderCounts.get(closestWilaya.name) + 1,
        );
      } else {
        wilayaOrderCounts.set(closestWilaya.name, 1);
      }
    });

    // Sort the wilayas by order count in descending order
    const sortedWilayas = Array.from(wilayaOrderCounts.entries()).sort(
      (a, b) => b[1] - a[1],
    );

    // Get the top 3 wilayas with the most orders
    const top3Wilayas = sortedWilayas.slice(0, 3);

    return top3Wilayas;

    // Helper function to find the closest wilaya based on lat and long
    function findClosestWilaya(lat: number, long: number) {
      let closestWilaya;
      let closestDistance = Number.MAX_VALUE;

      // Iterate through the data to find the closest wilaya
      wilayas.forEach((wilaya) => {
        const distance = calculateDistance(lat, long, wilaya.lat, wilaya.long);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestWilaya = wilaya;
        }
      });

      return closestWilaya;
    }

    // Helper function to calculate the distance between two points using Haversine formula
    function calculateDistance(
      lat1: number,
      long1: number,
      lat2: number,
      long2: number,
    ) {
      // Haversine formula
      const R = 6371; // Radius of the Earth in km
      const dLat = degToRad(lat2 - lat1);
      const dLong = degToRad(long2 - long1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) *
          Math.cos(degToRad(lat2)) *
          Math.sin(dLong / 2) *
          Math.sin(dLong / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance;
    }

    // Helper function to convert degrees to radians
    function degToRad(deg: number) {
      return deg * (Math.PI / 180);
    }
  }

  async getOrderCountsByWeek(): Promise<
    { week: number; orderCount: number }[]
  > {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Note: Months are zero-based, so add 1.

    // Calculate the start and end dates of the current month
    const startDate = new Date(currentYear, currentMonth - 1, 1); // Start from the 1st day
    const endDate = new Date(currentYear, currentMonth, 0); // End on the last day

    // Initialize an array to store weekly order counts
    const weeklyOrderCounts: { week: number; orderCount: number }[] = [];

    // Loop through each week of the month
    let week = 1;
    let currentWeekStart = startDate;

    while (currentWeekStart <= endDate) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // End of the week

      // Ensure that the current week's end date is within the current month
      if (currentWeekEnd <= endDate) {
        // Count the number of orders with status "DELIVERED" updated within the current week
        const orderCount = await this.repoOrders.count({
          where: {
            status: OrderStatus.DELIVERED,
            updatedAt: Between(currentWeekStart, currentWeekEnd),
          },
        });

        // Add the weekly order count to the array
        weeklyOrderCounts.push({ week, orderCount });

        // Move to the next week
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        week++;
      } else {
        // If the current week's end date is outside the current month, exit the loop
        break;
      }
    }

    return weeklyOrderCounts;
  }

  async getMissionCountsByWeek(): Promise<
    { week: number; orderCount: number }[]
  > {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Note: Months are zero-based, so add 1.

    // Calculate the start and end dates of the current month
    const startDate = new Date(currentYear, currentMonth - 1, 1); // Start from the 1st day
    const endDate = new Date(currentYear, currentMonth, 0); // End on the last day

    // Initialize an array to store weekly order counts
    const weeklyOrderCounts: { week: number; orderCount: number }[] = [];

    // Loop through each week of the month
    let week = 1;
    const currentWeekStart = startDate;

    while (currentWeekStart <= endDate) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // End of the week

      // Ensure that the current week's end date is within the current month
      if (currentWeekEnd <= endDate) {
        // Count the number of orders with status "DELIVERED" updated within the current week
        const orderCount = await this.repo.count({
          where: {
            status: MissionStatus.COMPLETED,
            updatedAt: Between(currentWeekStart, currentWeekEnd),
          },
        });

        // Add the weekly order count to the array
        weeklyOrderCounts.push({ week, orderCount });

        // Move to the next week
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        week++;
      } else {
        // If the current week's end date is outside the current month, exit the loop
        break;
      }
    }

    return weeklyOrderCounts;
  }

  async analytics(userId: number) {
    const status = [UserStatus.ACTIVE, UserStatus.IN_MISSION];

    const usersDelivery = await this.repoUsers.find({
      where: { role: UserRole.DELIVERY, status: In(status) },
    });

    const orders = await this.repoOrders.find({
      where: {
        status: OrderStatus.DELIVERED,
      },
    });

    const totalDeliveryFees = orders.reduce((total, order) => {
      // Convert the enum value to a numeric value using the getDistanceValue function
      const numericValue = this.getDistanceValue(order.deliveryFees);

      // Add the numeric value to the accumulator
      return total + numericValue;
    }, 0);

    const wilayas = await this.test();
    const weeksOrders = await this.getOrderCountsByWeek();
    const weeksMissions = await this.getMissionCountsByWeek();

    const deliverys = usersDelivery.length;

    const stringify = JSON.stringify({
      totalDeliveryFees,
      deliverys,
      wilayas,
      weeksOrders,
      weeksMissions,
    });

    return stringify;
  }

  async destination(userId: number) {
    const user = await this.repoUsers.findOne({ where: { id: userId } });

    const missionFinished = await this.missionHadFinishedOrders(userId);

    if (missionFinished) {
      return {
        latitude: 36.7538,
        longitude: 3.0588,
      };
    }

    const mission = await this.repo.findOne({
      relations: ['orders', 'delivery'],
      order: {
        createdAt: 'ASC',
        orders: { position: 'ASC' },
      },
      where: {
        delivery: {
          id: user?.id,
          status: UserStatus.IN_MISSION,
        },
        status: MissionStatus.IN_PROGRESS,
      },
    });

    const promises =
      mission?.orders?.map(async (order, index) => {
        if (order?.status === OrderStatus.OUT_FOR_DELIVERY) {
          return {
            latitude:
              index === 0
                ? order?.destinationLat
                : mission?.orders[index]?.destinationLat || 36.7538,
            longitude:
              index === 0
                ? order?.destinationLong
                : mission?.orders[index]?.destinationLong || 3.0588,
          };
        }
      }) || [];

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result) {
        return result;
      }
    }

    return {
      latitude: null,
      longitude: null,
    };
  }

  async missionHadFinishedOrders(userId: number) {
    const user = await this.repoUsers.findOne({ where: { id: userId } });

    const mission = await this.repo.findOne({
      relations: ['orders', 'delivery'],
      order: {
        createdAt: 'ASC',
        orders: { position: 'ASC' },
      },
      where: {
        delivery: {
          id: user?.id,
          status: UserStatus.IN_MISSION,
        },
        status: MissionStatus.IN_PROGRESS,
      },
    });

    const promises =
      mission?.orders?.map(async (order) => {
        if (order.status !== OrderStatus.DELIVERED) {
          return false;
        }
        return true;
      }) || [];

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result === false) {
        return false;
      }
    }

    return true;
  }

  async getActualMission(userId: number) {
    const mission = await this.repo.findOne({
      relations: ['delivery', 'orders'],
      order: {
        orders: {
          position: 'ASC',
        },
      },
      where: {
        status: MissionStatus.IN_PROGRESS,
        delivery: {
          id: userId,
        },
      },
    });

    if (!mission) {
      throw new NotFoundException('mission not found');
    }

    return mission;
  }

  /*   update(id: number, updateMissionInput: UpdateMissionInput) {
    return `This action updates a #${id} mission`;
  }

  remove(id: number) {
    return `This action removes a #${id} mission`;
  } */
}

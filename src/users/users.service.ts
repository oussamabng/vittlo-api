import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { UserStatus } from './enums/user-status.dto';
import { UserRole } from './enums/user-role.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { LoginAdmin } from './dto/login-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { VerifyOtp } from './dto/verify-otp.dto';
import { PaginationDto } from './dto/pagination.dto';
import { SearchDto } from './dto/search-dto';
import { Mission } from 'src/missions/entities/mission.entity';
import { MissionStatus } from 'src/missions/enums/mission-status.enum';
import { ConfigService } from '@nestjs/config';
import { Order } from 'src/orders/entities/order.entity';
import { Tracking } from 'src/tracking/entities/tracking.entity';
import { TrackingType } from 'src/tracking/enums/tracking-type.enum';
import { TrackingStatus } from 'src/tracking/enums/tracking-status.enum';
import { OrderStatus } from 'src/orders/enums/order-status.enum';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Mission) private repoMissions: Repository<Mission>,
    @InjectRepository(Tracking) private repoTracking: Repository<Tracking>,
    @InjectRepository(Order) private repoOrders: Repository<Order>,
    private readonly mailerService: MailerService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createAdminUserIfNotExists();
  }

  async createAdminUserIfNotExists() {
    const email = this.configService.get('ADMIN_EMAIL');
    const userExists = await this.repo.findOne({
      where: {
        role: UserRole.ADMIN,
        email,
      },
    });
    if (userExists) return;
    const hash = await argon2.hash(this.configService.get('ADMIN_PASSWORD'));

    const user = this.repo.create({
      email,
      password: hash,
      status: UserStatus.ACTIVE,
      role: UserRole.ADMIN,
    });
    await this.repo.save(user);
  }

  async createAdmin({ email, password }: CreateAdminDto) {
    const userExists = await this.repo.findOneBy({ email });
    if (userExists) {
      throw new BadRequestException('User already exists with this email');
    }
    const hash = await argon2.hash(password);

    const user = this.repo.create({
      email,
      password: hash,
      status: UserStatus.ACTIVE,
      role: UserRole.ADMIN,
    });
    await this.repo.save(user);

    return 'Admin Account Created Successfully.';
  }

  async createDelivery({
    email,
    password,
    adress,
    dateOfBirth,
    carModel,
    licensePlate,
    phoneNumber,
    carColor,
  }: CreateDeliveryDto) {
    const userExists = await this.repo.findOneBy({ email });
    if (userExists) {
      throw new BadRequestException('User already exists with this email');
    }
    const hash = await argon2.hash(password);

    const user = this.repo.create({
      email,
      password: hash,
      role: UserRole.DELIVERY,
      adress,
      dateOfBirth,
      carModel,
      licensePlate,
      carColor,
      phoneNumber,
    });

    return await this.repo.save(user);
  }

  async loginAdmin({ email, password }: LoginAdmin) {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User do not exists');
    }

    const passwordMatches = await argon2.verify(user.password, password);

    if (!passwordMatches) {
      throw new BadRequestException('Password is incorrect');
    }

    if (user.role === UserRole.DELIVERY) {
      throw new UnauthorizedException('Access denied');
    }

    return await this.getTokens(user.id, user.role);
  }

  async loginDelivery({ email, password }: LoginAdmin) {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User do not exists');
    }

    const passwordMatches = await argon2.verify(user.password, password);

    if (!passwordMatches) {
      throw new BadRequestException('Password is incorrect');
    }

    if (user.role === UserRole.ADMIN) {
      throw new UnauthorizedException('Access denied');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Access denied');
    }

    if (user.status === UserStatus.PENDING) {
      if (user.otpCodeExpireDate < new Date()) {
        const otpCode = this.generateOTP();

        const otpCodeExpireDate = new Date();

        otpCodeExpireDate.setMinutes(otpCodeExpireDate.getMinutes() + 30);

        this.sendVerificationEmail(user.email, otpCode);

        user.otp = otpCode;
        user.otpCodeExpireDate = otpCodeExpireDate;

        await this.repo.save(user);

        return {
          status: UserStatus.PENDING,
          access_token: null,
          refresh_token: null,
        };
      } else {
        this.sendVerificationEmail(user.email, user.otp);
        await this.repo.save(user);

        return {
          status: UserStatus.PENDING,
          access_token: null,
          refresh_token: null,
        };
      }
    }

    const tokens = await this.getTokens(user.id, user.role);

    const response = { status: user.status, ...tokens };

    return response;
  }

  async getTokens(userId: number, role?: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          role,
        },
        {
          secret: `${process.env.JWT_ACCESS_SECRET}`,
          expiresIn: '30d',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
        },
        {
          secret: `${process.env.JWT_REFRESH_SECRET}`,
          expiresIn: '30d',
        },
      ),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async sendVerificationEmail(email: string, otpCode: string) {
    await this.mailerService.sendMail({
      to: email,
      from: 'bengoudifa.contact@gmail.com',
      subject: 'OTP Verification',
      html: `<h3>Your OTP code is: ${otpCode}. This code will expire in 3 minutes.</h3>`,
    });
  }

  async verifyOtpDelivery({ code, email }: VerifyOtp) {
    const user = await this.repo.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.otp !== code || user.otpCodeExpireDate < new Date()) {
      throw new BadRequestException('Otp code expired');
    }

    user.status = UserStatus.ACTIVE;

    await this.repo.save(user);
    return 'Account Verified';
  }

  async getAllDeliveryUsers(
    { page, limit }: PaginationDto,
    { keyword }: SearchDto,
  ) {
    const skip = (page - 1) * limit;

    const [users, totalCount] = await this.repo.findAndCount({
      skip,
      take: limit,
      where: [
        {
          role: UserRole.DELIVERY,
          email: ILike(`%${keyword}%`),
        },
        /*      { email: ILike(`%${keyword}%`) },
        { carModel: ILike(`%${keyword}%`) },
        { licensePlate: ILike(`%${keyword}%`) },
        { carColor: ILike(`%${keyword}%`) },
        { adress: ILike(`%${keyword}%`) }, */
      ],
      order: {
        createdAt: 'ASC',
      },
      relations: ['missions', 'orders'],
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;

    return {
      items: users,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage,
    };
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['missions', 'orders'],
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  async updateStatusDelivery(userId: number, status: UserStatus) {
    const user = await this.findOne(userId);

    user.status = status;

    return await this.repo.save(user);
  }

  async refreshAccessToken(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new BadRequestException('bad token');
    }
    return await this.getTokens(user.id, user.role);
  }

  generateOTP(): string {
    return this.generateRandomNumber();
  }

  generateRandomNumber() {
    const min = 100000;
    const max = 999999;

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString();
  }

  async addDeliveryToMission(missionId: number, userId: number) {
    const user = await this.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found ');
    }
    const mission = await this.repoMissions.findOne({
      where: { id: missionId },
      relations: ['delivery', 'orders'],
    });

    if (!mission) {
      throw new NotFoundException('Mission not found ');
    }

    if (mission.delivery) {
      throw new BadRequestException('Mission already have a delivery');
    }

    mission.delivery = user;
    mission.status = MissionStatus.IN_PROGRESS;

    const trackingMission = this.repoTracking.create({
      type: TrackingType.MISSION,
      mission,
      status: TrackingStatus.OUT_FOR_DELIVERY,
      delivery: user,
    });

    await this.repoMissions.save(mission);
    await this.repoTracking.save(trackingMission);

    await Promise.all(
      mission.orders.map(async (order: Order) => {
        //add tracking to this order because order was assigned to delivery
        const tracking = this.repoTracking.create({
          type: TrackingType.ORDER,
          order: order,
          status: TrackingStatus.OUT_FOR_DELIVERY,
          delivery: user,
          mission: mission,
        });

        order.status = OrderStatus.OUT_FOR_DELIVERY;

        await this.repoOrders.save(order);
        await this.repoTracking.save(tracking);
      }),
    );

    await this.repo.save(user);
    await this.repoMissions.save(mission);

    return user;
  }

  async me(userId: number) {
    const user = await this.repo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }
}

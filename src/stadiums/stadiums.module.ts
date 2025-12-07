import { Module } from '@nestjs/common';
import { StadiumsService } from './stadiums.service';
import { StadiumsController } from './stadiums.controller';
import { PrismaService } from 'prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [StadiumsController],
  providers: [StadiumsService,PrismaService,AuthService,JwtService],
  exports: [StadiumsService]
})
export class StadiumsModule {}

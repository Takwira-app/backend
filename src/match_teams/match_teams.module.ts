import { Module } from '@nestjs/common';
import { MatchTeamsService } from './match_teams.service';
import { MatchTeamsController } from './match_teams.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsService } from 'src/notifications/notifications.service';


@Module({
  imports: [AuthModule],
  controllers: [MatchTeamsController],
  providers: [MatchTeamsService,PrismaService, NotificationsService],
  exports: [MatchTeamsService]

})
export class MatchTeamsModule {}

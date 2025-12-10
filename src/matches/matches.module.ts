import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchTeamsModule } from '../match_teams/match_teams.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  imports: [MatchTeamsModule,AuthModule],
  controllers: [MatchesController],
  providers: [MatchesService,PrismaService, NotificationsService],
  exports: [MatchesService]
  
})
export class MatchesModule {}

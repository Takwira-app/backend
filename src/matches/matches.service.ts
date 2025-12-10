import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { match_status } from 'generated/prisma/enums';
import { UpdateMatchTeamDto } from 'src/match_teams/dto/update-match_team.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { matches } from 'class-validator';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService,
  private notificationService: NotificationsService
  ) {}

  async create(dto: CreateMatchDto, userId: number) {
    const matchDate = new Date(dto.match_date);
    const startTime = new Date(dto.start_time);
    return this.prisma.matches.create({
      data: {
        ...dto,
        creator_id: userId,
        status: 'pending',
        match_date: matchDate,     
        start_time: startTime,
      },
    });
  }


  async findAll(query: any) {
    return this.prisma.matches.findMany({
      where: {
        status: query.status || undefined,
        creator_id: query.creator_id ? Number(query.creator_id) : undefined,
        stadium_id: query.stadium_id ? Number(query.stadium_id) : undefined,
        match_date: query.match_date || undefined,
      },
      include: {
        stadiums: true,
        users: true,
        match_teams: {
          include: { team_players: true },
        },
      },
    });
  }

  async findOne(match_id: number) {
    const match = await this.prisma.matches.findUnique({
      where: { match_id },
      include: {
        stadiums: true,
        users: true,
        match_teams: {
          include: { team_players: true },
        },
      },
    });

    if (!match) throw new NotFoundException('Match not found');
    return match;
  }


  async getJoined(userId: number) {
    return this.prisma.matches.findMany({
      where: {
        match_teams: {
          some: {
            team_players: {
              some: { player_id: userId },
            },
          },
        },
      },
      include: {
        stadiums: true,
        users: true,
        match_teams: true,
      },
    });
  }

  async getMyMatches(userId: number) {
    return this.prisma.matches.findMany({
      where: { creator_id: userId },
      include: {
        stadiums: true,
        match_teams: true,
      },
    });
  }

  async getTeams(matchId: number) {
    return this.prisma.match_teams.findMany({
      where: { match_id: matchId },
      include: {
        team_players: { include: { users: true } },
      },
    });
  }


  async update(match_id: number, dto: UpdateMatchDto, userId: number) {
    const match = await this.prisma.matches.findUnique({ where: { match_id } });

    if (!match) throw new NotFoundException('Match not found');
    if (match.creator_id !== userId)
      throw new ForbiddenException('Not allowed');

    return this.prisma.matches.update({
      where: { match_id },
      data: dto,
    });
  }

  async updateStatus(match_id: number, dto: UpdateStatusDto) {
    return this.prisma.matches.update({
      where: { match_id },
      data: { status: dto.status },
    });
  }


  async remove(match_id: number, userId: number) {
    const match = await this.prisma.matches.findUnique({ where: { match_id } });

    if (!match) throw new NotFoundException('Match not found');
    if (match.creator_id !== userId)
      throw new ForbiddenException('Not allowed');

    return this.prisma.matches.delete({ where: { match_id } });
  }
  async leaveMatch(match_id: number, userId: number) {
    const teamPlayer = await this.prisma.team_players.findFirst({
      where: {
        match_teams: { match_id },
        player_id: userId,
      },
    });

    if (!teamPlayer) throw new NotFoundException('Not in match');

    /*await this.notificationService.createNotification(
        matches.creator_id,
        `${user.name} left your match`,
        "A player has left the match."
      );*/

    return this.prisma.team_players.delete({
      where: { match_team_id_player_id: {
          match_team_id: teamPlayer.match_team_id,
          player_id: userId,
        }, },
    });
    

  }

  async getPendingRequests(userId: number) {
    return this.prisma.match_teams.findMany({
      where: {
        matches: { creator_id: userId, status: match_status.pending },
      },
      include: {
        matches: true,
        team_players: { include: { users: true } },
      },
    });
  }

  async approveRequest(matchId: number, dto: UpdateMatchTeamDto, userId: number) {

    const match = await this.prisma.matches.update({
      where: { match_id: matchId },
      data: { status: 'approved' },
      include: {
        users: true, // Créateur du match
        stadiums: true
      }
    });

    // Notifier le créateur
    /*await this.notificationService.createNotification(
      match.creator_id,
      'Match Approved! ',
      `Your match at ${match.stadiums.name} on ${match.match_date} has been approved!`,
      'match_approved',matchId
    );*/

    return match;

  }

  async rejectRequest(match_id: number, dto: UpdateMatchTeamDto, userId: number) {
   
  }


}

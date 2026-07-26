import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieFilterDto } from './dto/movie-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Movies')
@Controller({ path: 'movies', version: '1' })
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // ========== PUBLIC ==========

  @Get('published')
  @ApiOperation({ summary: 'List all published movies (public)' })
  getPublishedMovies(@Query() filter: MovieFilterDto) {
    return this.moviesService.getPublishedMovies(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie details by ID (public)' })
  getMovieById(@Param('id') id: string) {
    return this.moviesService.getMovieById(id);
  }

  // ========== PRODUCER ONLY ==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRODUCER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new movie (Producer only)' })
  create(@Body() dto: CreateMovieDto, @CurrentUser() user: { id: string }) {
    return this.moviesService.create(dto, user.id);
  }

  @Get('my/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRODUCER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List movies created by the current producer' })
  getMyMovies(
    @CurrentUser() user: { id: string },
    @Query() filter: MovieFilterDto,
  ) {
    return this.moviesService.getMyMovies(user.id, filter);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRODUCER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a movie (only owner)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.moviesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PRODUCER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a movie (only owner)' })
  async delete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    await this.moviesService.delete(id, user.id);
  }
}

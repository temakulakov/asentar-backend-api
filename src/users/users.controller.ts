import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.svc.create(dto);
    return plainToInstance(UserResponseDto, user);
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const all = await this.svc.findAll();
    return plainToInstance(UserResponseDto, all);
  }

  @Get(':vless')
  async findOne(@Param('vless') vless: string): Promise<UserResponseDto> {
    const user = await this.svc.findOne(vless);
    return plainToInstance(UserResponseDto, user);
  }

  @Put(':vless')
  async update(
    @Param('vless') vless: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.svc.update(vless, dto);
    return plainToInstance(UserResponseDto, user);
  }

  @Delete(':vless')
  async remove(@Param('vless') vless: string): Promise<void> {
    return this.svc.remove(vless);
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { MarzbanService } from './marzban.service';
import { MarzbanController } from './marzban.controller';
import { CreateUserIntegrationReqDto } from './dto/integration/user-create.integration.req.dto';
import { BaseUserDto } from './dto/base/user-base.dto';

const mockSvc: Partial<MarzbanService> = {
  create: jest.fn().mockResolvedValue({ username: 'foo' }),
  findOne: jest.fn().mockResolvedValue({ username: 'foo' }),
  findAll: jest.fn().mockResolvedValue({ total: 0, users: [] }),
  update: jest.fn().mockResolvedValue({ username: 'foo', note: 'bar' }),
  getExpiredUsers: jest.fn().mockResolvedValue(['foo']),
  getUserUsage: jest.fn().mockResolvedValue({}),
  revokeSubscription: jest.fn().mockResolvedValue({ ok: true }),
  removeUser: jest.fn().mockResolvedValue({ ok: true }),
  deleteExpiredUsers: jest.fn().mockResolvedValue({ deleted: 1 }),
};

describe('MarzbanController (unit)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarzbanController],
      providers: [{ provide: MarzbanService, useValue: mockSvc }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('POST /marzban -> 201', () => {
    const dto = { username: 'foo' } as CreateUserIntegrationReqDto;
    return request(app.getHttpServer())
      .post('/marzban')
      .send(dto)
      .expect(HttpStatus.CREATED)
      .expect({ username: 'foo' });
  });

  it('GET /marzban/foo -> 200', () =>
    request(app.getHttpServer())
      .get('/marzban/foo')
      .expect(HttpStatus.OK)
      .expect({ username: 'foo' } as BaseUserDto));

  // …repeat for each route using the matching mockSvc method…
});

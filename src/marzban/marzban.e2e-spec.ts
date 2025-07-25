import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import * as request from 'supertest';
import nock from 'nock';
import { AppModule } from '../app.module';

describe('MarzbanController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // spin up full Nest app (uses real interceptors / token refresh)
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule], // <-- your root module
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(() => nock.cleanAll());
  afterAll(() => app.close());

  it('POST /marzban should proxy to /api/user', async () => {
    // mock Marzban backend
    nock('https://h512.online')
      .post('/api/user')
      .reply(201, { username: 'john' });

    await request(app.getHttpServer())
      .post('/marzban')
      .send({ username: 'john' })
      .expect(201)
      .expect({ username: 'john' });
  });

  it('handles 409 from Marzban as HttpException', async () => {
    nock('https://h512.online').post('/api/user').reply(409, {
      detail: 'User already exists',
    });

    await request(app.getHttpServer())
      .post('/marzban')
      .send({ username: 'dup' })
      .expect(409)
      .expect({ detail: 'User already exists' });
  });

  // …add one happy‑path + one error case for each endpoint…
});

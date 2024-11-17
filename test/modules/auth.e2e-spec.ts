import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CreateUserDto, LoginDto } from '../../src/modules/users/users.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST /auth/signup: should throw form validation error', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({})
      .expect(422);
  });

  it('/POST /auth/signup: should create new user', () => {
    const user: CreateUserDto = {
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      password: faker.internet.password(),
    };
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(user)
      .expect(201);
  });

  it('/POST /auth/signup: should throw an error when user exists with same email', async () => {
    const email = faker.internet.email();

    const user1: CreateUserDto = {
      email,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      password: faker.internet.password(),
    };

    const user2: CreateUserDto = {
      email,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      password: faker.internet.password(),
    };

    const req = request(app.getHttpServer());

    await req.post('/auth/signup').send(user1).expect(201);

    return req.post('/auth/signup').send(user2).expect(409);
  });

  it('/POST /auth/login: should throw form validation error', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(422);
  });

  it('/POST /auth/login: should throw when user does not exist', async () => {
    const user: LoginDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(user)
      .expect(404);
  });

  it('/GET /auth/user: should throw error when access protected profile url', async () => {
    await request(app.getHttpServer()).get('/auth/user').expect(401);
  });

  it('/GET /auth/user: should return user when access protected profile url', async () => {
    const req = request(app.getHttpServer());

    const user: CreateUserDto = {
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      password: faker.internet.password(),
    };

    await req.post('/auth/signup').send(user).expect(201);

    const response = await req.post('/auth/login').send(user).expect(200);

    const result = await req
      .get('/auth/user')
      .set('Authorization', `Bearer ${response.body}`)
      .expect(200);

    expect(result.body.id).toBeGreaterThan(0);
    expect(result.body.email).toBe(user.email);
    expect(result.body.firstName).toBe(user.first_name);
    expect(result.body.lastName).toBe(user.last_name);
  });
});

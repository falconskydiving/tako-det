import * as pino from 'pino'
import * as supertest from 'supertest'
import { createContainer } from '../../src/container'
import { createServer } from '../../src/server'
import {
  CreateMembership,
  MembershipModel
} from '../../src/server/memberships/model'
import { CreateUser, UserModel } from '../../src/server/users/model'
import { CreateLevel, LevelModel } from '../../src/server/levels/model'
import { database } from './database-utils'

const logger = pino({ name: 'test', level: 'silent' })
const container = createContainer(database, logger)
const port = 8070

export const appServer = createServer(container)
export const testServer = appServer.listen(port)

export async function createUserTest(user: CreateUser): Promise<UserModel> {
  const res = await supertest(testServer)
    .post('/api/v1/users')
    .send(user)
    .expect(201)

  return res.body
}

export function shuttingDown(): void {
  container.health.shuttingDown()
}

export async function createMembershipTest(
  membership: CreateMembership,
  token: string
): Promise<MembershipModel> {
  const res = await supertest(testServer)
    .post('/api/v1/memberships')
    .set('Authorization', token)
    .send(membership)
    .expect(201)

  return res.body
}

export async function createLevelTest(
  level: CreateLevel,
  token: string
): Promise<LevelModel> {
  const res = await supertest(testServer)
    .post('/api/v1/levels')
    .set('Authorization', token)
    .send(level)
    .expect(201)

  return res.body
}

export async function getLoginToken(
  email: string,
  password: string
): Promise<string> {
  const res = await supertest(testServer)
    .post('/api/v1/users/login')
    .send({ email, password })
    .expect(200)

  return res.body.accessToken
}

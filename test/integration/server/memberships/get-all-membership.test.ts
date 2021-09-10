import { expect } from 'chai'
import * as supertest from 'supertest'
import { truncateTables } from '../../database-utils'
import {
  createLevelTest,
  createMembershipTest,
  createUserTest,
  getLoginToken,
  testServer
} from '../../server-utils'

describe('GET /api/v1/memberships', () => {
  let token: string
  let createdUser: any
  before(async () => {
    await truncateTables(['membership', 'user'])

    const user = {
      email: 'dude@gmail.com',
      firstName: 'super',
      lastName: 'mocha',
      password: 'secret',
      shopifyId: 1234123,
      rechargeId: 123123
    }

    createdUser = await createUserTest(user)
    token = await getLoginToken('dude@gmail.com', 'secret')
  })

  it('Should return a list of memberships', async () => {
    const level = {
      name: 'INSIDER ACCESS TIER',
      numberOfUsers: 'Single Teacher',
      monthlyPrice: 14.99,
      annualPrice: 164.89,
      monthlyCredit: 14.99,
      discount: 0.15,
      professionalDevelopmentCertificates: 5,
      detalk: 'Monthly Access',
      referralCredit: 20,
      otherPerks: JSON.stringify(['Early Access to All New Products'])
    }

    const createdLevel = await createLevelTest(level, token)

    const membership1 = {
      levelId: createdLevel.id,
      userId: createdUser.id
    }

    const membership2 = {
      levelId: createdLevel.id,
      userId: createdUser.id
    }

    await createMembershipTest(membership1, token)
    await createMembershipTest(membership2, token)

    const res = await supertest(testServer)
      .get('/api/v1/memberships')
      .set('Authorization', token)
      .expect(200)

    expect(res.body.length).equals(2)
    expect(res.body[0].levelId).equals(createdLevel.id)
    expect(res.body[1].levelId).equals(createdLevel.id)
  })

  it('Should return unauthorized when token is not valid', async () => {
    const res = await supertest(testServer)
      .get(`/api/v1/memberships`)
      .set('Authorization', 'wrong token')
      .expect(401)

    expect(res.body.code).equals(30002)
  })

  it('Should return unauthorized when token is missing', async () => {
    const res = await supertest(testServer)
      .get(`/api/v1/memberships`)
      .expect(401)

    expect(res.body.code).equals(30002)
  })
})

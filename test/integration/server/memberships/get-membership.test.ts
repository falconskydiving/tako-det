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

describe('GET /api/v1/memberships/:id', () => {
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
      rechargeId: 123123,
      availableMonthlyCredit: 14.99
    }

    createdUser = await createUserTest(user)
    token = await getLoginToken('dude@gmail.com', 'secret')
  })

  it('Should return a single membership', async () => {
    const level = {
      name: 'INSIDER ACCESS TIER',
      stub: 'insider',
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

    const membership = {
      levelId: createdLevel.id,
      userId: createdUser.id
    }
    const createdMembership = await createMembershipTest(membership, token)

    const res = await supertest(testServer)
      .get(`/api/v1/memberships/${createdMembership.id}`)
      .set('Authorization', token)
      .expect(200)

    expect(res.body).includes({
      levelId: createdLevel.id
    })
  })

  it('Should return 404 when membership does not exist', async () => {
    await supertest(testServer)
      .get(`/api/v1/memberships/111111111`)
      .set('Authorization', token)
      .expect(404)
  })

  it('Should return unauthorized when token is not valid', async () => {
    const res = await supertest(testServer)
      .get('/api/v1/memberships/1')
      .set('Authorization', 'wrong token')
      .expect(401)

    expect(res.body.code).equals(30002)
  })

  it('Should return unauthorized when token is missing', async () => {
    const res = await supertest(testServer)
      .get('/api/v1/memberships/1')
      .expect(401)

    expect(res.body.code).equals(30002)
  })
})

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

describe('DELETE /api/v1/memberships/:id', () => {
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

  it('Should delete a membership and return 204', async () => {
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

    const membership = {
      levelId: createdLevel.id,
      userId: createdUser.id
    }

    const createdMembership = await createMembershipTest(membership, token)

    await supertest(testServer)
      .delete(`/api/v1/memberships/${createdMembership.id}`)
      .set('Authorization', token)
      .expect(204)

    await supertest(testServer)
      .get(`/api/v1/memberships/${createdMembership.id}`)
      .set('Authorization', token)
      .expect(404)
  })

  it('Should return 404 when membership does not exist', async () => {
    await supertest(testServer)
      .delete(`/api/v1/memberships/1000000`)
      .set('Authorization', token)
      .expect(404)
  })

  it('Should return unauthorized when token is not valid', async () => {
    const res = await supertest(testServer)
      .delete(`/api/v1/memberships/1000000`)
      .set('Authorization', 'wrong token')
      .expect(401)

    expect(res.body.code).equals(30002)
  })

  it('Should return unauthorized when token is missing', async () => {
    const res = await supertest(testServer)
      .delete(`/api/v1/memberships/1000000`)
      .expect(401)

    expect(res.body.code).equals(30002)
  })
})

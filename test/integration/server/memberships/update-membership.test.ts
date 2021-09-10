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

describe('PUT /api/v1/memberships/:id', () => {
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

  beforeEach(async () => {
    await truncateTables(['membership'])
  })

  it('Should update a membership', async () => {
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
    const membership = await createMembershipTest(
      { levelId: createdLevel.id, userId: createdUser.id },
      token
    )
    const res = await supertest(testServer)
      .put(`/api/v1/memberships/${membership.id}`)
      .set('Authorization', token)
      .send({ levelId: createdLevel.id, active: true })
      .expect(200)

    expect(res.body).include({ levelId: createdLevel.id, active: true })
  })

  it('Should return 400 when missing body data', async () => {
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

    const membership = await createMembershipTest(
      { levelId: createdLevel.id, userId: createdUser.id },
      token
    )

    const res = await supertest(testServer)
      .put(`/api/v1/memberships/${membership.id}`)
      .set('Authorization', token)
      .send({ active: false })
      .expect(400)

    expect(res.body.code).equals(30001)
    expect(res.body.fields.length).equals(1)
    expect(res.body.fields[0].message).eql('"levelId" is required')
  })

  it('Should return unauthorized when token is not valid', async () => {
    const res = await supertest(testServer)
      .put('/api/v1/memberships/1')
      .set('Authorization', 'wrong token')
      .expect(401)

    expect(res.body.code).equals(30002)
  })

  it('Should return unauthorized when token is missing', async () => {
    const res = await supertest(testServer)
      .put('/api/v1/memberships/1')
      .expect(401)

    expect(res.body.code).equals(30002)
  })
})

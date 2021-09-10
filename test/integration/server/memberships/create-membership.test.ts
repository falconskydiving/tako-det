import { expect } from 'chai'
import * as supertest from 'supertest'
import { truncateTables } from '../../database-utils'
import {
  createLevelTest,
  createUserTest,
  getLoginToken,
  testServer
} from '../../server-utils'

describe('POST /api/v1/memberships', () => {
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

  it('Should create a membership and return 201', async () => {
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

    const res = await supertest(testServer)
      .post('/api/v1/memberships')
      .set('Authorization', token)
      .send(membership)
      .expect(201)

    expect(res.header.location).equals(`/api/v1/memberships/${res.body.id}`)
    expect(res.body).include({
      levelId: createdLevel.id,
      userId: createdUser.id
    })
  })

  it('Should return 400 when missing body data', async () => {
    const membership = { userId: createdUser.id }

    const res = await supertest(testServer)
      .post('/api/v1/memberships')
      .set('Authorization', token)
      .send(membership)
      .expect(400)

    expect(res.body.code).equals(30001)
    expect(res.body.fields.length).equals(1)
    expect(res.body.fields[0].message).eql('"levelId" is required')
  })

  it('Should return unauthorized when token is not valid', async () => {
    const res = await supertest(testServer)
      .post('/api/v1/memberships')
      .set('Authorization', 'wrong token')
      .expect(401)

    expect(res.body.code).equals(30002)
  })

  it('Should return unauthorized when token is missing', async () => {
    const res = await supertest(testServer)
      .post('/api/v1/memberships')
      .expect(401)

    expect(res.body.code).equals(30002)
  })
})

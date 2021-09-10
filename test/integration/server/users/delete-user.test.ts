import { expect } from 'chai'
import * as supertest from 'supertest'
import { database, setAdminMode, truncateTables } from '../../database-utils'
import {
  createLevelTest,
  createMembershipTest,
  createUserTest,
  getLoginToken,
  testServer
} from '../../server-utils'

describe('DELETE /api/v1/users/:id', () => {
  beforeEach(async () => {
    await truncateTables(['membership', 'user'])
  })

  it('Should delete a user', async () => {
    await createUserTest({
      email: 'guy@gmail.com',
      firstName: 'James',
      lastName: 'Christie',
      password: 'guymode',
      shopifyId: 123123,
      rechargeId: 123123
    })

    await setAdminMode('guy@gmail.com')
    const adminToken = await getLoginToken('guy@gmail.com', 'guymode')

    const user = await createUserTest({
      email: 'user@gmail.com',
      firstName: 'super',
      lastName: 'test',
      password: 'test',
      shopifyId: 1234123,
      rechargeId: 123123
    })

    const userToken = await getLoginToken('user@gmail.com', 'test')

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

    const createdLevel = await createLevelTest(level, userToken)

    const membership1 = {
      levelId: createdLevel.id,
      userId: 123123
    }

    const membership2 = {
      levelId: createdLevel.id,
      userId: 12312344
    }

    await createMembershipTest(membership1, userToken)

    await createMembershipTest(membership2, userToken)

    await supertest(testServer)
      .delete(`/api/v1/users/${user.id}`)
      .set('Authorization', adminToken)
      .expect(204)

    const conn = await database.getConnection()

    const users = await conn.from('user').select()

    expect(users.length).eql(1)
    expect(users[0].email).eql('guy@gmail.com')

    const memberships = await conn.from('membership').count()

    expect(memberships[0]['count(*)']).eql(0)
  })

  it('Should return not allowed error', async () => {
    await createUserTest({
      email: 'guy@gmail.com',
      firstName: 'James',
      lastName: 'Christie',
      password: 'guymode',
      shopifyId: 1234123,
      rechargeId: 123123
    })

    const user = await createUserTest({
      email: 'dude@gmail.com',
      firstName: 'super',
      lastName: 'test',
      password: 'test',
      shopifyId: 1234123,
      rechargeId: 123123
    })

    const token = await getLoginToken('guy@gmail.com', 'guymode')

    await supertest(testServer)
      .delete(`/api/v1/users/${user.id}`)
      .set('Authorization', token)
      .expect(403)
  })

  it('Should return unauthorized when token is not valid', async () => {
    const res = await supertest(testServer)
      .delete('/api/v1/users/${user.id}')
      .set('Authorization', 'wrong token')
      .expect(401)

    expect(res.body.code).equals(30002)
  })

  it('Should return unauthorized when token is missing', async () => {
    const res = await supertest(testServer)
      .delete('/api/v1/users/1')
      .expect(401)

    expect(res.body.code).equals(30002)
  })
})

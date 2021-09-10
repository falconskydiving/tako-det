import * as knex from 'knex'
import { BCryptHasher, Hasher } from '../../../lib/hasher'

export function up(db: knex) {
  return db.schema
    .createTable('level', table => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('stub').notNullable()
      table.string('number_of_users').notNullable()
      table.float('monthly_price').notNullable()
      table.float('annual_price').notNullable()
      table.float('monthly_credit').notNullable()
      table.float('discount').notNullable()
      table.float('professional_development_certificates').notNullable()
      table.string('detalk').notNullable()
      table.integer('referral_credit').notNullable()
      table.json('other_perks')
      table.dateTime('created').notNullable()
      table.dateTime('updated').notNullable()
    })
    .then(() => {
      return db.schema.createTable('user', table => {
        table.increments('id').primary()
        table.string('email', 64).unique()
        table.string('password', 256).notNullable()
        table.enum('role', ['user', 'admin']).notNullable()
        table.string('first_name', 64).notNullable()
        table.string('last_name', 64).notNullable()
        table.bigInteger('shopify_id').notNullable()
        table.bigInteger('recharge_id').notNullable()
        table.dateTime('created').notNullable()
        table.dateTime('updated').notNullable()
      })
    })
    .then(() => {
      return db.schema.createTable('membership', table => {
        table.increments('id').primary()
        table
          .integer('level_id')
          .notNullable()
          .unsigned()
          .references('id')
          .inTable('level')
        table.boolean('active').notNullable()
        table
          .integer('user_id')
          .notNullable()
          .unsigned()
          .references('id')
          .inTable('user')
        table.text('statistics')
        table.dateTime('created').notNullable()
        table.dateTime('updated').notNullable()
      })
    })
    .then(() => {
      return db.schema.createTable('member', table => {
        table.increments('id').primary()
        table
          .integer('user_id')
          .notNullable()
          .unsigned()
          .references('id')
          .inTable('user')
        table
          .integer('membership_id')
          .notNullable()
          .unsigned()
          .references('id')
          .inTable('membership')
        table.dateTime('created').notNullable()
        table.dateTime('updated').notNullable()
      })
    })
    .then(async () => {
      const hasher: Hasher = new BCryptHasher()
      const password = await hasher.hashPassword('secret')
      return db('user').insert([
        {
          email: 'api_tester@mail.com',
          first_name: 'api',
          last_name: 'tester',
          password,
          shopify_id: 1234123,
          recharge_id: 1234123,
          created: new Date(),
          updated: new Date()
        }
      ])
    })
    .then(() => {
      return db('level').insert([
        {
          name: 'INSIDER ACCESS TIER',
          stub: 'subscription:insider',
          number_of_users: 'Single Teacher',
          monthly_price: 14.99,
          annual_price: 164.89,
          monthly_credit: 14.99,
          discount: 0.15,
          professional_development_certificates: 5,
          detalk: 'Monthly Access',
          referral_credit: 20,
          other_perks: JSON.stringify(['Early Access to All New Products']),
          created: new Date(),
          updated: new Date()
        },
        {
          name: 'ELITE ACCESS TIER',
          stub: 'subscription:elite',
          number_of_users: 'Multiple Teachers',
          monthly_price: 29.99,
          annual_price: 329.89,
          monthly_credit: 29.99,
          discount: 0.15,
          professional_development_certificates: 0,
          detalk: 'Monthly Access',
          referral_credit: 20,
          other_perks: JSON.stringify([
            'Early Access to All New Products',
            '1 Free Download per Quarter',
            'Quarterly Virtual Happy Hours',
            'Quarterly Virtual Master Class/Performance',
            'Quarterly Virtual Curriculum Slam',
            'Vault Access to ALL Previous DET Virtual Events',
            { 'Discount on 1-on-1 Coaching': 0.1 }
          ]),
          created: new Date(),
          updated: new Date()
        },
        {
          name: 'TEAM ACCESS TIER',
          stub: 'subscription:team',
          number_of_users: 'Single Teacher',
          monthly_price: 0,
          annual_price: 0,
          monthly_credit: 29.99,
          discount: 0.15,
          professional_development_certificates: 0,
          detalk: 'Monthly Access',
          referral_credit: 20,
          other_perks: JSON.stringify([
            'Early Access to All New Products',
            '1 Free Download per Quarter',
            'Quarterly Virtual Happy Hours',
            'Quarterly Virtual Master Class/Performance',
            'Quarterly Virtual Curriculum Slam',
            'Vault Access to ALL Previous DET Virtual Events',
            { 'Discount on 1-on-1 Coaching': 0.1 }
          ]),
          created: new Date(),
          updated: new Date()
        }
      ])
    })
}

export function down(db: knex) {
  return db.schema
    .dropTable('level')
    .dropTable('member')
    .dropTable('membership')
    .dropTable('user')
}

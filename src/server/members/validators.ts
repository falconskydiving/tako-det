import * as Joi from 'joi'

export const updateMember: Joi.SchemaMap = {}

export const createMember: Joi.SchemaMap = {
  userId: Joi.number().required(),
  membershipId: Joi.number().required()
}

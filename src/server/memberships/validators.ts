import * as Joi from 'joi'

export const updateMembership: Joi.SchemaMap = {
  levelId: Joi.number().required(),
  active: Joi.boolean().required()
}

export const createMembership: Joi.SchemaMap = {
  levelId: Joi.number().required()
}

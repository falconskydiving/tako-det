import * as Joi from 'joi'

export const updateLevel: Joi.SchemaMap = {
  name: Joi.string().required(),
  numberOfUsers: Joi.string().required(),
  monthlyPrice: Joi.number().required(),
  annualPrice: Joi.number().required(),
  monthlyCredit: Joi.number().required(),
  discount: Joi.number().required(),
  professionalDevelopmentCertificates: Joi.number().required(),
  detalk: Joi.string().required(),
  referralCredit: Joi.number().required(),
  otherPerks: Joi.string().required()
}

export const createLevel: Joi.SchemaMap = {
  name: Joi.string().required(),
  numberOfUsers: Joi.string().required(),
  monthlyPrice: Joi.number().required(),
  annualPrice: Joi.number().required(),
  monthlyCredit: Joi.number().required(),
  discount: Joi.number().required(),
  professionalDevelopmentCertificates: Joi.number().required(),
  detalk: Joi.string().required(),
  referralCredit: Joi.number().required(),
  otherPerks: Joi.string().required()
}

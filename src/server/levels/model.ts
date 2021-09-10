import { Level } from '../../entities'

export interface CreateLevel {
  name: string
  stub: string
  numberOfUsers: string
  monthlyPrice: number
  annualPrice: number
  monthlyCredit: number
  discount: number
  professionalDevelopmentCertificates: number
  detalk: string
  referralCredit: number
  otherPerks: string
}

export class LevelModel {
  public id?: number
  public name: string
  public stub: string
  public numberOfUsers: string
  public monthlyPrice: number
  public annualPrice: number
  public monthlyCredit: number
  public discount: number
  public professionalDevelopmentCertificates: number
  public detalk: string
  public referralCredit: number
  public otherPerks: string
  public created: Date
  public updated: Date

  constructor(level: Level) {
    this.id = level.id
    this.name = level.name
    this.stub = level.stub
    this.numberOfUsers = level.numberOfUsers
    this.monthlyPrice = level.monthlyPrice
    this.annualPrice = level.annualPrice
    this.monthlyCredit = level.monthlyCredit
    this.discount = level.discount
    this.professionalDevelopmentCertificates =
      level.professionalDevelopmentCertificates
    this.detalk = level.detalk
    this.referralCredit = level.referralCredit
    this.otherPerks = level.otherPerks
    this.created = level.created
    this.updated = level.updated
  }
}

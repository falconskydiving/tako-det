import { Logger } from 'pino'
import { Authenticator, JWTAuthenticator } from './lib/authentication'
import { MySql } from './lib/database'
import { BCryptHasher, Hasher } from './lib/hasher'
import { HealthMonitor } from './lib/health'
import {
  LevelManager,
  MemberManager,
  MembershipManager,
  UserManager
} from './managers'
import {
  LevelRepository,
  MemberRepository,
  MembershipRepository,
  UserRepository
} from './repositories'

export interface ServiceContainer {
  health: HealthMonitor
  logger: Logger
  lib: {
    hasher: Hasher
    authenticator: Authenticator
  }
  repositories: {
    membership: MembershipRepository
    user: UserRepository
    member: MemberRepository
    level: LevelRepository
  }
  managers: {
    membership: MembershipManager
    user: UserManager
    member: MemberManager
    level: LevelManager
  }
}

export function createContainer(db: MySql, logger: Logger): ServiceContainer {
  const membershipRepo = new MembershipRepository(db)
  const userRepo = new UserRepository(db)
  const memberRepo = new MemberRepository(db)
  const levelRepo = new LevelRepository(db)
  const hasher = new BCryptHasher()
  const authenticator = new JWTAuthenticator(userRepo)
  const healthMonitor = new HealthMonitor()

  return {
    health: healthMonitor,
    logger,
    lib: {
      hasher,
      authenticator
    },
    repositories: {
      membership: membershipRepo,
      user: userRepo,
      member: memberRepo,
      level: levelRepo
    },
    managers: {
      level: new LevelManager(levelRepo),
      membership: new MembershipManager(membershipRepo),
      member: new MemberManager(memberRepo),
      user: new UserManager(userRepo, hasher, authenticator)
    }
  }
}

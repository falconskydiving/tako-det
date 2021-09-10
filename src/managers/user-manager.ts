import { User } from '../entities'
import { ValidationError } from '../errors'
import { Authenticator } from '../lib/authentication'
import { Hasher } from '../lib/hasher'
import { UserRepository } from '../repositories'

export class UserManager {
  private repo: UserRepository
  private hasher: Hasher
  private auth: Authenticator

  constructor(repo: UserRepository, hasher: Hasher, auth: Authenticator) {
    this.repo = repo
    this.hasher = hasher
    this.auth = auth
  }

  public async findByEmail(email: string): Promise<User> {
    return this.repo.findByEmail(email)
  }

  public async findAll(): Promise<User[]> {
    return this.repo.findAll()
  }

  public async findByShopifyId(id: number): Promise<User> {
    return this.repo.findByShopifyId(id)
  }

  public async create(user: User): Promise<User> {
    const hashPassword = await this.hasher.hashPassword(user.password)

    user.password = hashPassword

    return this.repo.insert(user)
  }

  public async login(email: string, password: string): Promise<any> {
    const user = await this.repo.findByEmail(email)
    if (await this.hasher.verifyPassword(password, user.password)) {
      const accessToken = this.auth.authenticate(user)

      return { accessToken, user }
    }

    throw new ValidationError('Wrong credentials')
  }

  public update(user: User): Promise<User> {
    return this.repo.update(user)
  }

  public async changePassword(
    email: string,
    newPassword: string,
    oldPassword: string
  ): Promise<void> {
    const user = await this.repo.findByEmail(email)
    const validPassword = await this.hasher.verifyPassword(
      oldPassword,
      user.password
    )

    if (!validPassword) {
      throw new ValidationError('Old password is not correct')
    }

    const hashPassword = await this.hasher.hashPassword(newPassword)

    return this.repo.changePassword(email, hashPassword)
  }

  public delete(userId: number): Promise<void> {
    return this.repo.delete(userId)
  }
}

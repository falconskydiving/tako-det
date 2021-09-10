import { Level } from '../entities'
import { LevelRepository } from '../repositories'

export class LevelManager {
  private repo: LevelRepository

  constructor(repo: LevelRepository) {
    this.repo = repo
  }

  public find(id: number): Promise<Level> {
    return this.repo.find(id)
  }
  public async findAll(limit?: number, offset?: number): Promise<Level[]> {
    return this.repo.findAll(limit, offset)
  }

  public async findByStub(stub: string): Promise<Level> {
    return this.repo.findByStub(stub)
  }

  public create(level: Level): Promise<Level> {
    return this.repo.insert(level)
  }

  public update(level: Level): Promise<Level> {
    return this.repo.update(level)
  }

  public delete(userId: number, levelId: number): Promise<void> {
    return this.repo.delete(userId, levelId)
  }
}

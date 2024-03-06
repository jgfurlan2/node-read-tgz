export class ModulesStore {
  private readonly _store = new Map<string, StreamModule>()

  get modules(): Map<string, StreamModule> {
    return this._store
  }

  public getModule(relativePath: string): StreamModule {
    let mod = this._store.get(relativePath)
    if (mod == null) {
      mod = this._store.get(`${relativePath}.js`)
    }

    return mod
  }

  public addModule(streamFile: StreamModule): void {
    this._store.set(streamFile.path, streamFile)
  }
}

export const modulesStore = new ModulesStore()

export interface ContextType<TState = unknown, TActions = unknown> {
  state: TState
  actions: TActions
}

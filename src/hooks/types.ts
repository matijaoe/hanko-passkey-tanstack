export type AsyncState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'error'; message: string }

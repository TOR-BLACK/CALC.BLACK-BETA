export interface ApiProgressStateType {
  lastNow: number;
  lastKBytes: number;
}

export interface ApiProgressType {
  get: () => ApiProgressStateType;
  set: (state: ApiProgressStateType) => void;
  reset: () => void;
}

// this works out to about a second of precision loss, which seems acceptable
// (Base32 is 5 bits per character = 30 bits lost, latter 10 bits are clock ID,
// other 20 are microseconds, 0b1_00000_00000_00000_00000/1_000_000 = 1.048576)
const maxLen = 6;

declare abstract class TID {
  static next(prev?: TID): TID;
  static fromStr(str: string): TID;
  toString(): string;
}

export function modifyTid(tid: TID | undefined, obj: typeof TID) {
  const nextTid = obj.next(tid);
  if (tid) {
    return nextTid;
  } else {
    const suffix = window.nitesky.settings.tidSuffix!.slice(0, maxLen);
    const moddedTid = nextTid.toString().slice(0, -suffix.length) + suffix;
    return obj.fromStr(moddedTid);
  }
}

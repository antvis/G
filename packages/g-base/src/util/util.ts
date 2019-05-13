
export function removeFromArray(arr: any[], obj: any) {
  const index = arr.indexOf(obj);
  if (index !== -1) {
    arr.splice(index, 1);
  }
}

export const isBrowser = (typeof window !== 'undefined') && (typeof window.document !== 'undefined');

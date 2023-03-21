
export enum StorageKeys {
  ROOM_ID = "roomId"
}

export const useSession = (key: string) => {
  const set = (value: string) => {
    sessionStorage.setItem(key, value);
  };

  const get = () => {
    return sessionStorage.getItem(key);
  };

  const clear = () => {
    sessionStorage.removeItem(key);
  };

  return {
    get,
    set,
    clear
  };
};

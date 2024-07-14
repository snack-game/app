import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {storageKey} from '../types';
import {UserStore} from './types';

const initialData: Pick<UserStore, 'user' | 'cookie'> = {
  user: undefined,
  cookie: undefined,
};

const useUserStore = create<UserStore>()(
  persist<UserStore>(
    set => ({
      hasHydrated: false,
      ...initialData,
      saveUser: (user: any) => set({user}),
      saveCookie: cookie => set({cookie}),
      clearUser: () => set(() => ({...initialData})),
    }),
    {
      name: storageKey.USER_STORE,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useUserStore.setState({hasHydrated: true});
      },
    },
  ),
);

export default useUserStore;

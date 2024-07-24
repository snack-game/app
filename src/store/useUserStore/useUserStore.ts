import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {storageKey} from '../types';
import {UserStore} from './types';

const initialData: Pick<UserStore, 'user'> = {
  user: undefined,
};

const useUserStore = create<UserStore>()(
  persist<UserStore>(
    set => ({
      hasHydrated: false,
      clear: () => set(() => ({...initialData})),
      saveUser: (user: any) => set({user}),
      ...initialData,
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

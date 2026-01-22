import { GameServer, GameVersion } from '@/modules/Dofus/game/types/game.types';
import { defineStore } from 'pinia';

/* ======================
   TYPES
====================== */

type DofusState = {
  gameVersions: GameVersion[];
  currentGameVersionId: number | null;
  gameServers: GameServer[];
  currentGameServerId: number | null;
};

/* ======================
   STORE
====================== */

export const useDofusStore = defineStore('dofus', {
  state: (): DofusState => ({
    gameVersions: [],
    currentGameVersionId: null,
    gameServers: [],
    currentGameServerId: null,
  }),

  getters: {
    currentGameVersion: (s) =>
      s.gameVersions.find((v) => v.id === s.currentGameVersionId) || null,

    currentGameServer: (s) =>
      s.gameServers.find((gs) => gs.id === s.currentGameServerId) || null,
  },

  actions: {
    setGameVersions(gameVersions: GameVersion[]) {
      this.gameVersions = gameVersions;
    },

    setCurrentGameVersion(id: number) {
      this.currentGameVersionId = id;
      localStorage.setItem('dofus.gameVersionId', String(id));
    },

    setGameServers(gameServers: GameServer[]) {
      this.gameServers = gameServers;
    },

    setCurrentGameServer(id: number) {
      this.currentGameServerId = id;
      localStorage.setItem('dofus.gameServerId', String(id));
    },

    hydrateFromStorage() {
      const gameVersionStored = localStorage.getItem('dofus.gameVersionId');
      const gameServerStored = localStorage.getItem('dofus.gameServerId');

      this.currentGameVersionId = gameVersionStored
        ? Number(gameVersionStored)
        : null;

      this.currentGameServerId = gameServerStored
        ? Number(gameServerStored)
        : null;
    },

    validateSelections() {
      if (
        this.currentGameVersionId !== null &&
        !this.gameVersions.some((v) => v.id === this.currentGameVersionId)
      ) {
        this.currentGameVersionId = null;
        localStorage.removeItem('dofus.gameVersionId');
      }

      if (
        this.currentGameServerId !== null &&
        !this.gameServers.some((s) => s.id === this.currentGameServerId)
      ) {
        this.currentGameServerId = null;
        localStorage.removeItem('dofus.gameServerId');
      }
    },

    clear() {
      this.gameVersions = [];
      this.gameServers = [];
      this.currentGameVersionId = null;
      this.currentGameServerId = null;
      localStorage.removeItem('dofus.gameVersionId');
      localStorage.removeItem('dofus.gameServerId');
    },
  },
});

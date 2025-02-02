import { TInitParams } from "../src/crypto.d";
import { TButtonParams } from "./interface.d";
import { TUserEnvironment } from "./utils.d";

export interface IPrefsModule {
    _prefs: TPrefs;

    _cache: TCache;

    /**
     * Initialize the user preferences.
     * @see TPrefs
     */
    init(params: TPrefs): void;

    /**
     * Get the user preferences.
     * @see TPrefs
     */
    prefs(): TPrefs

    /**
     * Get the user cache.
     * @see TCache
     */
    cache(): TCache
}

export type TPrefs = {
    interface: {
        theme: string;
        button: TButtonParams | null;
    }
    crypto: TInitParams | null;
    dev: {
        logs: {
            enabled: boolean;
            pretty: boolean;
            modal: boolean;
        }
    }
}

export type TCache = {
    user: { environment: TUserEnvironment };
}
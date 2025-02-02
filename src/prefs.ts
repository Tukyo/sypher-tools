import { IPrefsModule, TCache, TPrefs } from '../src/prefs.d';
import { TInitParams } from './crypto.d';
import { TButtonParams } from './interface.d';
import { TUserEnvironment } from './utils.d';

export const PrefsModule: IPrefsModule = {
    _prefs: {
        interface: {
            theme: "custom",
            button: {} as TButtonParams
        },
        crypto: {} as TInitParams,
        dev: {
            logs: {
                enabled: false,
                pretty: false,
                modal: false
            }
        }
    },

    _cache: {
        user: {
            environment: {} as TUserEnvironment
        }
    },

    
    init: function (params: TPrefs): void {
        this._prefs = params;

        if (params.dev.logs.modal) {
            if (!params.dev.logs.enabled) { console.warn('Cannot create a log modal when logs are disabled.'); }
            else {
                sypher.createModal({
                    append: document.body,
                    type: "log",
                    theme: params.interface.theme
                });
            }
        }

        if (params.interface.theme === "none") { params.interface.theme = 'custom'; }
        sypher.initTheme(params.interface.theme);

        if (params.crypto) {
            sypher.initPublicProviders();
        }
    
        if (params.interface.button) {
            const buttonParams: TButtonParams = {
                ...params.interface.button,
                ...(params.crypto && { initCrypto: params.crypto })
            };
            sypher.createButton(buttonParams);
        }

        this._cache = {
            user: { environment: sypher.userEnvironment() }
        };
    },
    prefs: function (): TPrefs {
        const prefs = this._prefs;
        if (!prefs) { throw new Error('User preferences have not been initialized.'); }
        return prefs
    },
    cache: function (): TCache {
        const cache = this._cache;
        if (!cache) { throw new Error('User cache has not been initialized.'); }
        return cache
    }
}
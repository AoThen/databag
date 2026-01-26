import { useContext, useState, useEffect } from 'react';
import { getNodeConfig } from 'api/getNodeConfig';
import { setNodeConfig } from 'api/setNodeConfig';
import { getNodeAccounts } from 'api/getNodeAccounts';
import { removeAccount } from 'api/removeAccount';
import { addAccountCreate } from 'api/addAccountCreate';
import { useNavigate } from 'react-router-dom';
import { AppContext } from 'context/AppContext';
import { SettingsContext } from 'context/SettingsContext';

import { getAdminMFAuth } from 'api/getAdminMFAuth';
import { addAdminMFAuth } from 'api/addAdminMFAuth';
import { setAdminMFAuth } from 'api/setAdminMFAuth';
import { removeAdminMFAuth } from 'api/removeAdminMFAuth';

import { getIPBlocks, addIPBlock, removeIPBlock } from 'api/getIPBlocks';
import { getIPWhitelist, addIPWhitelist, removeIPWhitelist } from 'api/getIPWhitelist';

export function useDashboard(token) {

  const [state, setState] = useState({
    domain: "",
    accountStorage: null,
    keyType: null,
    pushSupported: null,
    allowUnsealed: null,
    transformSupported: false,
    enableImage: null,
    enableAudio: null,
    enableVideo: null,
    enableBinary: null,
    enableIce: null,
    iceServiceFlag: null,
    iceUrl: null,
    iceUsername: null,
    icePassword: null,
    enableOpenAccess: null,
    openAccessLimit: null,

    configError: false,
    accountsError: false,
    createToken: null,
    showSettings: false,
    showCreate: false,
    busy: false,
    accounts: [],
    colors: {},
    menuStyle: {},
    strings: {},

    mfaModal: false,
    mfAuthSet: false,
    mfAuthEnabled: false,
    mfAuthSecretText: null,
    mfAuthSecretImage: null,
    mfaAuthError: null,
    mfaCode: '',

    showIPBlocks: false,
    blocks: [],
    whitelist: [],
    blockIP: '',
    blockReason: '',
    blockDuration: 24,
    whitelistIP: '',
    whitelistNote: '',
  });

  const navigate = useNavigate();
  const app = useContext(AppContext);
  const settings = useContext(SettingsContext);

  const updateState = (value) => {
    setState((s) => ({ ...s, ...value }));
  }

  useEffect(() => {
    if (!app.state.adminToken) {
      navigate('/');
    }
    else {
      syncConfig();
      syncAccounts();
    }
    // eslint-disable-next-line
  }, [app]);

  useEffect(() => {
    const { strings, colors, menuStyle } = settings.state;
    updateState({ strings, colors, menuStyle });
  }, [settings.state]);

  const actions = {
    setCreateLink: async () => {
      if (!state.createBusy) {
        updateState({ busy: true });
        try {
          const create = await addAccountCreate(app.state.adminToken)
          updateState({ createToken: create, showCreate: true });
        }
        catch (err) {
          window.alert(err);
        }
        updateState({ busy: false });
      }
    },
    setShowCreate: (showCreate) => {
      updateState({ showCreate });
    },
    removeAccount: async (accountId) => {
      await removeAccount(app.state.adminToken, accountId);
      syncAccounts();
    },
    setHost: (domain) => {
      updateState({ domain });
    },
    setStorage: (accountStorage) => {
      updateState({ accountStorage });
    },
    setKeyType: (keyType) => {
      updateState({ keyType });
    },
    setPushSupported: (pushSupported) => {
      updateState({ pushSupported });
    },
    setAllowUnsealed: (allowUnsealed) => {
      updateState({ allowUnsealed });
    },
    setEnableImage: (enableImage) => {
      updateState({ enableImage });
    },
    setEnableAudio: (enableAudio) => {
      updateState({ enableAudio });
    },
    setEnableVideo: (enableVideo) => {
      updateState({ enableVideo });
    },
    setEnableBinary: (enableBinary) => {
      updateState({ enableBinary });
    },
    setEnableIce: (enableIce) => {
      updateState({ enableIce });
    },
    setIceServiceFlag: (iceServiceFlag) => {
      const iceUrl = iceServiceFlag ? 'https://rtc.live.cloudflare.com/v1/turn/keys/%%TURN_KEY_ID%%/credentials/generate' : '';
      updateState({ iceServiceFlag, iceUrl });
    },
    setIceUrl: (iceUrl) => {
      updateState({ iceUrl });
    },
    setIceUsername: (iceUsername) => {
      updateState({ iceUsername });
    },
    setIcePassword: (icePassword) => {
      updateState({ icePassword });
    },
    setEnableOpenAccess: (enableOpenAccess) => {
      updateState({ enableOpenAccess });
    },
    setOpenAccessLimit: (openAccessLimit) => {
      updateState({ openAccessLimit });
    },
    setShowSettings: (value) => {
      updateState({ showSettings: value });
    },
    logout: () => {
      app.actions.clearAdmin();
    },
    reload: async () => {
      await syncConfig();
      await syncAccounts();
    },
    reloadIPBlocks: async () => {
      await syncIPBlocks();
      await syncIPWhitelist();
    },
    setCode: async (code) => {
      updateState({ mfaCode: code });
    },
    enableMFA: async () => {
      const mfa = await addAdminMFAuth(app.state.adminToken);
      updateState({ mfaModal: true, mfaError: false, mfaText: mfa.secretText, mfaImage: mfa.secretImage, mfaCode: '' });
    },
    disableMFA: async () => {
      await removeAdminMFAuth(app.state.adminToken);
      updateState({ mfaAuthEnabled: false });
    },
    confirmMFA: async () => {
      try {
        await setAdminMFAuth(app.state.adminToken, state.mfaCode);
        updateState({ mfaAuthEnabled: true, mfaModal: false });
      }
      catch (err) {
        const msg = err?.message;
        updateState({ mfaError: msg });
      }
    },
    dismissMFA: async () => {
      updateState({ mfaModal: false });
    },
    setShowIPBlocks: (showIPBlocks) => {
      updateState({ showIPBlocks });
    },
    setBlockIP: (blockIP) => {
      updateState({ blockIP });
    },
    setBlockReason: (blockReason) => {
      updateState({ blockReason });
    },
    setBlockDuration: (blockDuration) => {
      updateState({ blockDuration });
    },
    setWhitelistIP: (whitelistIP) => {
      updateState({ whitelistIP });
    },
    setWhitelistNote: (whitelistNote) => {
      updateState({ whitelistNote });
    },
    addBlock: async () => {
      if (!state.busy && state.blockIP) {
        updateState({ busy: true });
        try {
          await addIPBlock(app.state.adminToken, state.blockIP, state.blockReason || 'manual block', state.blockDuration);
          updateState({ blockIP: '', blockReason: '', blockDuration: 24 });
          await syncIPBlocks();
        }
        catch (err) {
          console.log(err);
          throw new Error("failed to block IP");
        }
        updateState({ busy: false });
      }
    },
    removeBlock: async (ip) => {
      await removeIPBlock(app.state.adminToken, ip);
      await syncIPBlocks();
    },
    addWhitelist: async () => {
      if (!state.busy && state.whitelistIP) {
        updateState({ busy: true });
        try {
          await addIPWhitelist(app.state.adminToken, state.whitelistIP, state.whitelistNote || 'whitelisted IP');
          updateState({ whitelistIP: '', whitelistNote: '' });
          await syncIPWhitelist();
        }
        catch (err) {
          console.log(err);
          throw new Error("failed to add to whitelist");
        }
        updateState({ busy: false });
      }
    },
    removeWhitelist: async (ip) => {
      await removeIPWhitelist(app.state.adminToken, ip);
      await syncIPWhitelist();
    },
    setSettings: async () => {
      if (!state.busy) {
        updateState({ busy: true });
        try {
          const { domain, keyType, accountStorage, pushSupported, transformSupported, allowUnsealed, enableImage, enableAudio, enableVideo, enableBinary, enableIce, iceServiceFlag, iceUrl, iceUsername, icePassword, enableOpenAccess, openAccessLimit } = state;
          const storage = accountStorage * 1073741824;
          const iceService = iceServiceFlag ? 'cloudflare' : '';
          const config = { domain,  accountStorage: storage, keyType, enableImage, enableAudio, enableVideo, enableBinary, pushSupported, transformSupported, allowUnsealed, enableIce, iceService, iceUrl, iceUsername, icePassword, enableOpenAccess, openAccessLimit };
          await setNodeConfig(app.state.adminToken, config);
          updateState({ busy: false, showSettings: false });
        }
        catch(err) {
          console.log(err);
          updateState({ busy: false });
          throw new Error("failed to set settings");
        }
      }
    },
  };

  const syncConfig = async () => {
    try {
      const enabled = await getAdminMFAuth(app.state.adminToken);
      const config = await getNodeConfig(app.state.adminToken);
      const { accountStorage, domain, keyType, pushSupported, transformSupported, allowUnsealed, enableImage, enableAudio, enableVideo, enableBinary, enableIce, iceService, iceUrl, iceUsername, icePassword, enableOpenAccess, openAccessLimit } = config;
      const iceServiceFlag = iceService === 'cloudflare';
      const storage = Math.ceil(accountStorage / 1073741824);
      updateState({ mfAuthSet: true, mfaAuthEnabled: enabled, configError: false, domain, accountStorage: storage, keyType, enableImage, enableAudio, enableVideo, enableBinary, pushSupported, transformSupported, allowUnsealed, enableIce, iceServiceFlag, iceUrl, iceUsername, icePassword, enableOpenAccess, openAccessLimit });
    }
    catch(err) {
      console.log(err);
      updateState({ configError: true });
    }
  };

  const syncAccounts = async () => {
    try {
      const accounts = await getNodeAccounts(app.state.adminToken);
      accounts.sort((a, b) => {
        if (a.handle < b.handle) {
          return -1;
        }
        if (a.handle > b.handle) {
          return 1;
        }
        return 0;
      });
      updateState({ accounstError: false, accounts });
    }
    catch(err) {
      console.log(err);
      updateState({ accountsError: true });
    }
  };

  const syncIPBlocks = async () => {
    try {
      const result = await getIPBlocks(app.state.adminToken);
      updateState({ blocks: result.blocks || [] });
    }
    catch(err) {
      console.log(err);
    }
  };

  const syncIPWhitelist = async () => {
    try {
      const result = await getIPWhitelist(app.state.adminToken);
      updateState({ whitelist: result.whitelist || [] });
    }
    catch(err) {
      console.log(err);
    }
  };

  return { state, actions };
}


import { useState } from 'react';
import { getIPBlocks, addIPBlock, removeIPBlock, type IPBlock } from '../api';
import { getIPWhitelist, addIPWhitelist, removeIPWhitelist, type IPWhitelist } from '../api';
import { AppContext } from '../context/AppContext';

export interface IPBlockState {
  showIPBlocks: boolean;
  blocks: IPBlock[];
  whitelist: IPWhitelist[];
  blockIP: string;
  blockReason: string;
  blockDuration: number;
  whitelistIP: string;
  whitelistNote: string;
  error: string | null;
  loading: boolean;
}

interface IPBlockActions {
  setShowIPBlocks: (show: boolean) => void;
  setBlockIP: (ip: string) => void;
  setBlockReason: (reason: string) => void;
  setBlockDuration: (duration: number) => void;
  setWhitelistIP: (ip: string) => void;
  setWhitelistNote: (note: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reloadIPBlocks: () => Promise<void>;
  addBlock: () => Promise<void>;
  removeBlock: (ip: string) => Promise<void>;
  addWhitelist: () => Promise<void>;
  removeWhitelist: (ip: string) => Promise<void>;
}

export function useIPBlock(app: typeof AppContext extends React.Context<infer T> ? T : never): { state: IPBlockState; actions: IPBlockActions } {
  const [state, setState] = useState<IPBlockState>({
    showIPBlocks: false,
    blocks: [],
    whitelist: [],
    blockIP: '',
    blockReason: '',
    blockDuration: 24,
    whitelistIP: '',
    whitelistNote: '',
    error: null,
    loading: false,
  });

  const getToken = (): string => {
    const service = (app as any).state.service as { token?: string } | null | undefined;
    return service?.token || '';
  };

  const actions: IPBlockActions = {
    setShowIPBlocks: (show: boolean) => {
      setState((prev) => ({ ...prev, showIPBlocks: show }));
      if (show) {
        actions.reloadIPBlocks();
      }
    },
    setBlockIP: (ip: string) => setState((prev) => ({ ...prev, blockIP: ip })),
    setBlockReason: (reason: string) => setState((prev) => ({ ...prev, blockReason: reason })),
    setBlockDuration: (duration: number) => setState((prev) => ({ ...prev, blockDuration: duration })),
    setWhitelistIP: (ip: string) => setState((prev) => ({ ...prev, whitelistIP: ip })),
    setWhitelistNote: (note: string) => setState((prev) => ({ ...prev, whitelistNote: note })),
    setError: (error: string | null) => setState((prev) => ({ ...prev, error })),
    setLoading: (loading: boolean) => setState((prev) => ({ ...prev, loading })),
    
    reloadIPBlocks: async () => {
      const token = getToken();
      if (!token) {
        actions.setError('Not logged in as admin');
        return;
      }
      try {
        const [blocksResult, whitelistResult] = await Promise.all([
          getIPBlocks(token),
          getIPWhitelist(token),
        ]);
        setState((prev) => ({
          ...prev,
          blocks: blocksResult.blocks || [],
          whitelist: whitelistResult.whitelist || [],
          error: null,
        }));
      } catch (err) {
        console.error('Failed to load IP blocks:', err);
        actions.setError('Failed to load IP blocks');
      }
    },
    
    addBlock: async () => {
      const token = getToken();
      if (!token) {
        actions.setError('Not logged in as admin');
        return;
      }
      if (!state.blockIP || state.loading) return;
      actions.setLoading(true);
      actions.setError(null);
      try {
        await addIPBlock(token, state.blockIP, state.blockReason || 'manual block', state.blockDuration);
        setState((prev) => ({
          ...prev,
          blockIP: '',
          blockReason: '',
          blockDuration: 24,
        }));
        await actions.reloadIPBlocks();
      } catch (err) {
        console.error('Failed to block IP:', err);
        actions.setError('Failed to block IP');
      } finally {
        actions.setLoading(false);
      }
    },
    
    removeBlock: async (ip: string) => {
      const token = getToken();
      if (!token) {
        actions.setError('Not logged in as admin');
        return;
      }
      actions.setLoading(true);
      actions.setError(null);
      try {
        await removeIPBlock(token, ip);
        await actions.reloadIPBlocks();
      } catch (err) {
        console.error('Failed to unblock IP:', err);
        actions.setError('Failed to unblock IP');
      } finally {
        actions.setLoading(false);
      }
    },
    
    addWhitelist: async () => {
      const token = getToken();
      if (!token) {
        actions.setError('Not logged in as admin');
        return;
      }
      if (!state.whitelistIP || state.loading) return;
      actions.setLoading(true);
      actions.setError(null);
      try {
        await addIPWhitelist(token, state.whitelistIP, state.whitelistNote || 'whitelisted IP');
        setState((prev) => ({
          ...prev,
          whitelistIP: '',
          whitelistNote: '',
        }));
        await actions.reloadIPBlocks();
      } catch (err) {
        console.error('Failed to add to whitelist:', err);
        actions.setError('Failed to add to whitelist');
      } finally {
        actions.setLoading(false);
      }
    },
    
    removeWhitelist: async (ip: string) => {
      const token = getToken();
      if (!token) {
        actions.setError('Not logged in as admin');
        return;
      }
      actions.setLoading(true);
      actions.setError(null);
      try {
        await removeIPWhitelist(token, ip);
        await actions.reloadIPBlocks();
      } catch (err) {
        console.error('Failed to remove from whitelist:', err);
        actions.setError('Failed to remove from whitelist');
      } finally {
        actions.setLoading(false);
      }
    },
  };

  return { state, actions };
}

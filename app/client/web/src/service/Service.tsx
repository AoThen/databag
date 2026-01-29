import React, { useState, useContext } from 'react'
import { Drawer, Tooltip, ActionIcon } from '@mantine/core'
import classes from './Service.module.css'
import { useService } from './useService.hook'
import { useIPBlock } from './useIPBlock'
import { TbAddressBook, TbSettings, TbShield, TbTrash, TbDatabase } from "react-icons/tb";
import { Accounts } from '../accounts/Accounts'
import { Setup } from '../setup/Setup'
import { IPBlockModal } from './IPBlockModal'
import { AdminDashboard } from '../admin/AdminDashboard'
import { useDisclosure } from '@mantine/hooks'
import { AppContext } from '../context/AppContext'

export function Service() {
  const { state: serviceState } = useService()
  const app = useContext(AppContext);
  const [tab, setTab] = useState('accounts')
  const [setup, { open: openSetup, close: closeSetup }] = useDisclosure(false)
  const [cleanup, { open: cleanupOpen, close: cleanupClose }] = useDisclosure(false)

  const { state: ipState, actions: ipActions } = useIPBlock(app)

  const openIPBlock = () => {
    ipActions.setShowIPBlocks(true);
  };

  return (
    <div className={classes.service}>
      {serviceState.layout === 'small' && (
        <>
          <div className={classes.body}>
            <div className={tab === 'setup' ? classes.show : classes.hide}>
              <div className={classes.screen}>
                <Setup />
              </div>
            </div>
            <div className={tab === 'accounts' ? classes.show : classes.hide}>
              <div className={classes.screen}>
                <Accounts openSetup={() => {}} openIPBlock={openIPBlock} openCleanup={() => setTab('cleanup')} />
              </div>
            </div>
            <div className={tab === 'cleanup' ? classes.show : classes.hide}>
              <div className={classes.screen}>
                <AdminDashboard />
              </div>
            </div>
          </div>
          <div className={classes.tabs}>
            {tab === 'accounts' && (
              <div className={classes.activeTabItem}>
                <TbAddressBook className={classes.tabIcon} />
              </div>
            )}
            {tab !== 'accounts' && (
              <div className={classes.idleTabItem} onClick={() => setTab('accounts')}>
                <TbAddressBook className={classes.tabIcon} />
              </div>
            )}
            <div className={classes.tabDivider} />
            {tab === 'cleanup' && (
              <Tooltip label="数据清理" withArrow>
                <div className={classes.activeTabItem} onClick={() => setTab('cleanup')}>
                  <TbTrash className={classes.tabIcon} />
                </div>
              </Tooltip>
            )}
            {tab !== 'cleanup' && (
              <Tooltip label="数据清理" withArrow>
                <div className={classes.idleTabItem} onClick={() => setTab('cleanup')}>
                  <TbTrash className={classes.tabIcon} />
                </div>
              </Tooltip>
            )}
            <div className={classes.tabDivider} />
            {tab === 'setup' && (
              <div className={classes.activeTabItem}>
                <TbSettings className={classes.tabIcon} />
              </div>
            )}
            {tab !== 'setup' && (
              <div className={classes.idleTabItem} onClick={() => setTab('setup')}>
                <TbSettings className={classes.tabIcon} />
              </div>
            )}
            <div className={classes.tabDivider} />
            <Tooltip label="IP Management">
              <div className={classes.idleTabItem} onClick={openIPBlock}>
                <TbShield className={classes.tabIcon} />
              </div>
            </Tooltip>
          </div>
        </>
      )}
      {serviceState.layout === 'large' && (
        <div className={classes.display}>
          <Accounts openSetup={openSetup} openIPBlock={openIPBlock} openCleanup={cleanupOpen} />
          <Drawer opened={setup} onClose={closeSetup} withCloseButton={false} size="550px" padding="0" position="right">
            <div style={{ height: '100vh' }}>
              <Setup />
            </div>
          </Drawer>
          <Drawer opened={cleanup} onClose={cleanupClose} withCloseButton={true} size="700px" padding="0" position="right">
            <div style={{ height: '100vh', overflow: 'auto' }}>
              <AdminDashboard />
            </div>
          </Drawer>
        </div>
      )}
      
      <IPBlockModal
        opened={ipState.showIPBlocks}
        onClose={() => ipActions.setShowIPBlocks(false)}
        strings={serviceState.strings}
        state={ipState}
        actions={{
          setBlockIP: ipActions.setBlockIP,
          setBlockReason: ipActions.setBlockReason,
          setBlockDuration: ipActions.setBlockDuration,
          setWhitelistIP: ipActions.setWhitelistIP,
          setWhitelistNote: ipActions.setWhitelistNote,
          addBlock: ipActions.addBlock,
          removeBlock: ipActions.removeBlock,
          addWhitelist: ipActions.addWhitelist,
          removeWhitelist: ipActions.removeWhitelist,
        }}
      />
    </div>
  )
}

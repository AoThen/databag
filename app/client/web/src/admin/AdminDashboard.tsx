import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { DisplayContext } from '../context/DisplayContext'
import { ContextType } from '../context/ContextType'
import { cleanupData, getCleanupStatus, getCleanupConfig, setCleanupConfig } from '../api/cleanupApi'
import classes from './AdminDashboard.module.css'
import { 
  Modal, TextInput, PasswordInput, Button, Select, Switch, 
  NumberInput, Text, Divider, Badge, Progress, Card, Group, 
  Stack, ActionIcon, Tooltip
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { 
  TbTrash, TbClock, TbDatabase, TbFile, TbRefresh, 
  TbSettings, TbCheck, TbAlertTriangle, TbInfoCircle,
  TbArchive, TbChartBar
} from 'react-icons/tb'

interface CleanupStatus {
  totalTopics: number
  totalAssets: number
  totalAccounts: number
  oldTopics: number
  oldAssets: number
  estimatedSpace: number
  lastCleanupTime?: number
}

interface CleanupConfig {
  cleanupEnabled: boolean
  cleanupIntervalHours: number
  messageRetentionDays: number
  assetRetentionDays: number
}

export function AdminDashboard() {
  const app = useContext(AppContext) as ContextType
  const display = useContext(DisplayContext) as ContextType

  const adminToken = app.state.service?.getToken?.() || (app.state.service as any)?.token || ''

  const [status, setStatus] = useState<CleanupStatus | null>(null)
  const [config, setConfigState] = useState<CleanupConfig>({
    cleanupEnabled: false,
    cleanupIntervalHours: 24,
    messageRetentionDays: 90,
    assetRetentionDays: 180,
  })
  const [loading, setLoading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<any>(null)
  const [settingsOpened, { open: settingsOpen, close: cleanupClose }] = useDisclosure(false)
  const [statusOpened, { open: statusOpen, close: statusClose }] = useDisclosure(false)

  const strings = display.state.strings

  useEffect(() => {
    if (adminToken) {
      loadStatus()
      loadConfig()
    }
  }, [adminToken])

  const loadStatus = async () => {
    try {
      const data = await getCleanupStatus(adminToken)
      setStatus(data)
    } catch (err) {
      console.error('Failed to load cleanup status:', err)
    }
  }

  const loadConfig = async () => {
    try {
      const data = await getCleanupConfig(adminToken)
      setConfigState({
        cleanupEnabled: data.cleanupEnabled || false,
        cleanupIntervalHours: data.cleanupIntervalHours || 24,
        messageRetentionDays: data.messageRetentionDays || 90,
        assetRetentionDays: data.assetRetentionDays || 180,
      })
    } catch (err) {
      console.error('Failed to load cleanup config:', err)
    }
  }

  const saveConfig = async () => {
    setLoading(true)
    try {
      await setCleanupConfig(adminToken, config)
      cleanupClose()
      loadStatus()
    } catch (err) {
      console.error('Failed to save config:', err)
      modals.openConfirmModal({
        title: strings.operationFailed,
        children: <Text>{strings.tryAgain}</Text>,
        confirmProps: { display: 'none' },
        cancelProps: { display: 'none' },
      })
    } finally {
      setLoading(false)
    }
  }

  const executeCleanup = async (dryRun: boolean) => {
    setCleaning(true)
    try {
      const result = await cleanupData(adminToken, {
        retentionDays: config.messageRetentionDays,
        includeAssets: true,
        dryRun: dryRun,
      })
      
      setCleanupResult(result)
      
      if (!dryRun) {
        modals.openConfirmModal({
          title: dryRun ? strings.check : strings.success,
          children: (
            <Stack gap="xs">
              <Group justify="space-between">
                <Text>{strings.deletedMessages}:</Text>
                <Text fw="bold">{result.deletedTopics}</Text>
              </Group>
              <Group justify="space-between">
                <Text>{strings.deletedFiles}:</Text>
                <Text fw="bold">{result.deletedAssets}</Text>
              </Group>
              <Group justify="space-between">
                <Text>{strings.freedSpace}:</Text>
                <Text fw="bold">{formatBytes(result.freedBytes)}</Text>
              </Group>
              <Group justify="space-between">
                <Text>{strings.affectedAccounts}:</Text>
                <Text fw="bold">{result.affectedAccounts}</Text>
              </Group>
              <Group justify="space-between">
                <Text>{strings.processingTime}:</Text>
                <Text fw="bold">{result.processingTime}ms</Text>
              </Group>
            </Stack>
          ),
          confirmProps: { display: 'none' },
          cancelProps: { label: strings.close },
        })
        
        loadStatus()
      } else {
        statusOpen()
      }
    } catch (err) {
      console.error('Cleanup failed:', err)
      modals.openConfirmModal({
        title: strings.operationFailed,
        children: <Text>{strings.tryAgain}</Text>,
        confirmProps: { display: 'none' },
        cancelProps: { display: 'none' },
      })
    } finally {
      setCleaning(false)
    }
  }

  const confirmCleanup = () => {
    modals.openConfirmModal({
      title: strings.confirmCleanup,
      children: (
        <Text size="sm" c="dimmed">
          {strings.cleanupWarning.replace('{days}', config.messageRetentionDays.toString())}
        </Text>
      ),
      labels: { confirm: strings.cleanup, cancel: strings.cancel },
      onConfirm: () => executeCleanup(false),
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return strings.never
    return new Date(timestamp * 1000).toLocaleString()
  }

  const estimatedMessagePercent = status ? (status.oldTopics / Math.max(status.totalTopics, 1)) * 100 : 0
  const estimatedAssetPercent = status ? (status.oldAssets / Math.max(status.totalAssets, 1)) * 100 : 0

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Text className={classes.title}>{strings.dataCleanup}</Text>
        <Group gap="xs">
          <Button 
            variant="light" 
            leftSection={<TbSettings size={16} />}
            onClick={settingsOpen}
          >
            {strings.settings}
          </Button>
          <Button 
            variant="light" 
            leftSection={<TbRefresh size={16} />}
            onClick={loadStatus}
            loading={loading}
          >
            {strings.refresh}
          </Button>
        </Group>
      </div>

      <div className={classes.statsGrid}>
        <Card className={classes.statCard} padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text className={classes.statLabel}>{strings.totalMessages}</Text>
            <TbDatabase size={20} className={classes.statIcon} />
          </Group>
          <Text className={classes.statValue}>{status?.totalTopics || 0}</Text>
          <Text className={classes.statSubtext} c="dimmed">
            {strings.oldDataWarning.replace('{count}', (status?.oldTopics || 0).toString())}
          </Text>
          <Progress 
            value={estimatedMessagePercent} 
            color="red" 
            size="sm" 
            mt="md" 
            animated={estimatedMessagePercent > 50}
          />
        </Card>

        <Card className={classes.statCard} padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text className={classes.statLabel}>{strings.totalFiles}</Text>
            <TbFile size={20} className={classes.statIcon} />
          </Group>
          <Text className={classes.statValue}>{status?.totalAssets || 0}</Text>
          <Text className={classes.statSubtext} c="dimmed">
            {strings.oldAssetsWarning.replace('{count}', (status?.oldAssets || 0).toString())}
          </Text>
          <Progress 
            value={estimatedAssetPercent} 
            color="orange" 
            size="sm" 
            mt="md" 
            animated={estimatedAssetPercent > 50}
          />
        </Card>

        <Card className={classes.statCard} padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text className={classes.statLabel}>{strings.estimatedSpace}</Text>
            <TbChartBar size={20} className={classes.statIcon} />
          </Group>
          <Text className={classes.statValue}>{formatBytes(status?.estimatedSpace || 0)}</Text>
          <Text className={classes.statSubtext} c="dimmed">
            {strings.canBeFreed}
          </Text>
        </Card>

        <Card className={classes.statCard} padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text className={classes.statLabel}>{strings.lastCleanup}</Text>
            <TbClock size={20} className={classes.statIcon} />
          </Group>
          <Text className={classes.statValue} size="lg">
            {formatTime(status?.lastCleanupTime)}
          </Text>
          <Text className={classes.statSubtext} c="dimmed">
            {strings.autoCleanupStatus.replace('{enabled}', config.cleanupEnabled ? strings.enabled : strings.disabled)}
          </Text>
        </Card>
      </div>

      <div className={classes.actionsSection}>
        <Card className={classes.actionCard} padding="lg" radius="md" withBorder>
          <div className={classes.actionHeader}>
            <TbTrash size={24} className={classes.actionIcon} />
            <div>
              <Text className={classes.actionTitle}>{strings.manualCleanup}</Text>
              <Text className={classes.actionSubtitle}>
                {strings.cleanupDescription.replace('{days}', config.messageRetentionDays.toString())}
              </Text>
            </div>
          </div>
          
          <div className={classes.actionConfig}>
            <Group justify="space-between">
              <div>
                <Text size="sm" fw="500">{strings.messageRetention}</Text>
                <Text size="xs" c="dimmed">{strings.messageRetentionDesc}</Text>
              </div>
              <Badge size="lg" variant="light">{config.messageRetentionDays} {strings.days}</Badge>
            </Group>
            
            <Group justify="space-between" mt="md">
              <div>
                <Text size="sm" fw="500">{strings.assetRetention}</Text>
                <Text size="xs" c="dimmed">{strings.assetRetentionDesc}</Text>
              </div>
              <Badge size="lg" variant="light">{config.assetRetentionDays} {strings.days}</Badge>
            </Group>
          </div>

          <Divider my="md" />

          <Group justify="center" gap="md">
            <Button 
              variant="light" 
              color="gray"
              leftSection={<TbInfoCircle size={16} />}
              onClick={() => executeCleanup(true)}
              loading={cleaning}
            >
              {strings.preview}
            </Button>
            <Button 
              variant="filled" 
              color="red"
              leftSection={<TbTrash size={16} />}
              onClick={confirmCleanup}
              loading={cleaning}
            >
              {strings.cleanupNow}
            </Button>
          </Group>
        </Card>

        <Card className={classes.infoCard} padding="lg" radius="md" withBorder>
          <div className={classes.infoHeader}>
            <TbSettings size={20} className={classes.infoIcon} />
            <Text className={classes.infoTitle}>{strings.autoCleanup}</Text>
          </div>
          
          <div className={classes.infoContent}>
            <Group justify="space-between" mb="md">
              <Text size="sm">{strings.enableAutoCleanup}</Text>
              <Switch 
                checked={config.cleanupEnabled}
                onChange={(e) => setConfigState({ ...config, cleanupEnabled: e.currentTarget.checked })}
              />
            </Group>
            
            {config.cleanupEnabled && (
              <>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">{strings.cleanupInterval}</Text>
                  <Text size="sm" fw="500">
                    {config.cleanupIntervalHours} {strings.hours}
                  </Text>
                </Group>
                
                <Text size="xs" c="dimmed" mt="xs">
                  {strings.autoCleanupNote}
                </Text>
              </>
            )}
          </div>

          <Divider my="md" />

          <Button 
            fullWidth 
            variant="light" 
            onClick={saveConfig}
            loading={loading}
            disabled={!config.cleanupEnabled}
          >
            {strings.saveSettings}
          </Button>
        </Card>
      </div>

      <Modal 
        opened={settingsOpened} 
        onClose={settingsClose} 
        title={strings.cleanupSettings}
        size="md"
      >
        <Stack gap="md">
          <div>
            <Switch 
              label={strings.enableAutoCleanup}
              description={strings.enableAutoCleanupDesc}
              checked={config.cleanupEnabled}
              onChange={(e) => setConfigState({ ...config, cleanupEnabled: e.currentTarget.checked })}
            />
          </div>
          
          <NumberInput
            label={strings.cleanupInterval}
            description={strings.cleanupIntervalDesc}
            value={config.cleanupIntervalHours}
            onChange={(val) => setConfigState({ ...config, cleanupIntervalHours: Number(val) || 24 })}
            min={1}
            max={8760}
            suffix={` ${strings.hours}`}
          />
          
          <NumberInput
            label={strings.messageRetentionDays}
            description={strings.messageRetentionDaysDesc}
            value={config.messageRetentionDays}
            onChange={(val) => setConfigState({ ...config, messageRetentionDays: Number(val) || 90 })}
            min={1}
            max={3650}
            suffix={` ${strings.days}`}
          />
          
          <NumberInput
            label={strings.assetRetentionDays}
            description={strings.assetRetentionDaysDesc}
            value={config.assetRetentionDays}
            onChange={(val) => setConfigState({ ...config, assetRetentionDays: Number(val) || 180 })}
            min={1}
            max={3650}
            suffix={` ${strings.days}`}
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={settingsClose}>
              {strings.cancel}
            </Button>
            <Button variant="filled" onClick={saveConfig} loading={loading}>
              {strings.save}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal 
        opened={statusOpened} 
        onClose={statusClose} 
        title={strings.cleanupPreview}
        size="md"
      >
        {cleanupResult && (
          <Stack gap="md">
            <Card withBorder padding="md" radius="md">
              <Text fw="500" mb="sm">{strings.estimatedCleanup}</Text>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">{strings.willDeleteMessages}:</Text>
                  <Badge color="red">{cleanupResult.deletedTopics}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{strings.willDeleteFiles}:</Text>
                  <Badge color="orange">{cleanupResult.deletedAssets}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{strings.willFreeSpace}:</Text>
                  <Badge color="green">{formatBytes(cleanupResult.freedBytes)}</Badge>
                </Group>
              </Stack>
            </Card>
            
            <Alert icon={<TbAlertTriangle size={16} />} color="yellow">
              {strings.previewNote}
            </Alert>
            
            <Group justify="flex-end">
              <Button variant="default" onClick={statusClose}>
                {strings.close}
              </Button>
              <Button 
                variant="filled" 
                color="red"
                onClick={() => {
                  statusClose()
                  confirmCleanup()
                }}
              >
                {strings.executeCleanup}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  )
}

function Alert({ children, icon, color }: { children: React.ReactNode; icon: any; color: string }) {
  return (
    <div style={{ 
      padding: '12px', 
      borderRadius: '4px', 
      backgroundColor: color === 'yellow' ? '#fef3c7' : undefined,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {icon}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}

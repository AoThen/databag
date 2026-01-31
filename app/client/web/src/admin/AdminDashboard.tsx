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

const DEFAULT_STRINGS = {
  dataCleanup: '数据清理',
  settings: '设置',
  refresh: '刷新',
  totalMessages: '总消息数',
  totalFiles: '总文件数',
  estimatedSpace: '预估空间',
  lastCleanup: '上次清理',
  never: '从未',
  enabled: '已启用',
  disabled: '已禁用',
  oldDataWarning: '{count}条旧消息可清理',
  oldAssetsWarning: '{count}个旧文件可清理',
  canBeFreed: '可释放空间',
  autoCleanupStatus: '自动清理: {enabled}',
  cleanupWarning: '此操作将删除超过{days}天的消息和相关文件，是否继续？',
  confirmCleanup: '确认清理',
  cleanup: '清理',
  cancel: '取消',
  deletedMessages: '删除消息',
  deletedFiles: '删除文件',
  freedSpace: '释放空间',
  affectedAccounts: '影响账户',
  processingTime: '处理时间',
  check: '检查',
  success: '成功',
  operationFailed: '操作失败',
  tryAgain: '请重试',
  close: '关闭',
  manualCleanup: '手动清理',
  cleanupDescription: '清理超过{days}天的旧消息',
  messageRetention: '消息保留',
  messageRetentionDesc: '超过此天数的老消息将被删除',
  assetRetention: '文件保留',
  assetRetentionDesc: '超过此天数的老文件将被删除',
  days: '天',
  hours: '小时',
  preview: '预览',
  cleanupNow: '立即清理',
  autoCleanup: '自动清理',
  enableAutoCleanup: '启用自动清理',
  cleanupInterval: '清理间隔',
  saveSettings: '保存设置',
  cleanupSettings: '清理设置',
  cleanupIntervalDesc: '自动清理的执行频率',
  messageRetentionDays: '消息保留天数',
  messageRetentionDaysDesc: '消息保留天数说明',
  assetRetentionDays: '文件保留天数',
  assetRetentionDaysDesc: '文件保留天数说明',
  save: '保存',
  estimatedCleanup: '预估清理结果',
  willDeleteMessages: '将删除消息',
  willDeleteFiles: '将删除文件',
  willFreeSpace: '将释放空间',
  previewNote: '预览模式下不会实际删除任何数据',
  executeCleanup: '执行清理',
  cleanupPreview: '清理预览',
  autoCleanupNote: '自动清理将根据设置的间隔执行',
  enableAutoCleanupDesc: '启用后将自动清理旧数据',
}

function getString(strings: typeof DEFAULT_STRINGS, key: keyof typeof DEFAULT_STRINGS, fallbackStrings: Record<string, string> = {}): string {
  return (strings as any)[key] || fallbackStrings[key] || DEFAULT_STRINGS[key] || ''
}

function replacePlaceholder(text: string, placeholder: string, value: string): string {
  if (!text || typeof text !== 'string') {
    return text
  }
  return text.replace(placeholder, value)
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

  const strings = { ...DEFAULT_STRINGS, ...display.state.strings }
  const str = (key: keyof typeof DEFAULT_STRINGS) => strings[key] || DEFAULT_STRINGS[key] || ''

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
        title: str('operationFailed'),
        children: <Text>{str('tryAgain')}</Text>,
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
          title: dryRun ? str('check') : str('success'),
          children: (
            <Stack gap="xs">
              <Group justify="space-between">
                <Text>{str('deletedMessages')}:</Text>
                <Text fw="bold">{result.deletedTopics}</Text>
              </Group>
              <Group justify="space-between">
                <Text>{str('deletedFiles')}:</Text>
                <Text fw="bold">{result.deletedAssets}</Text>
              </Group>
              <Group justify="space-between">
                <Text>{str('freedSpace')}:</Text>
                <Text fw="bold">{formatBytes(result.freedBytes)}</Text>
              </Group>
              <Group justify="space-between">
                <Text>{str('affectedAccounts')}:</Text>
                <Text fw="bold">{result.affectedAccounts}</Text>
              </Group>
              <Group justify="space-between">
                <Text>{str('processingTime')}:</Text>
                <Text fw="bold">{result.processingTime}ms</Text>
              </Group>
            </Stack>
          ),
          confirmProps: { display: 'none' },
          cancelProps: { children: str('close') },
        })
        
        loadStatus()
      } else {
        statusOpen()
      }
    } catch (err) {
      console.error('Cleanup failed:', err)
      modals.openConfirmModal({
        title: str('operationFailed'),
        children: <Text>{str('tryAgain')}</Text>,
        confirmProps: { display: 'none' },
        cancelProps: { display: 'none' },
      })
    } finally {
      setCleaning(false)
    }
  }

  const confirmCleanup = () => {
    modals.openConfirmModal({
      title: str('confirmCleanup'),
      children: (
        <Text size="sm" c="dimmed">
          {replacePlaceholder(str('cleanupWarning'), '{days}', config.messageRetentionDays.toString())}
        </Text>
      ),
      labels: { confirm: str('cleanup'), cancel: str('cancel') },
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
        <Text className={classes.title}>{str('dataCleanup')}</Text>
        <Group gap="xs">
          <Button 
            variant="light" 
            leftSection={<TbSettings size={16} />}
            onClick={settingsOpen}
          >
            {str('settings')}
          </Button>
          <Button 
            variant="light" 
            leftSection={<TbRefresh size={16} />}
            onClick={loadStatus}
            loading={loading}
          >
            {str('refresh')}
          </Button>
        </Group>
      </div>

      <div className={classes.statsGrid}>
        <Card className={classes.statCard} padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text className={classes.statLabel}>{str('totalMessages')}</Text>
            <TbDatabase size={20} className={classes.statIcon} />
          </Group>
          <Text className={classes.statValue}>{status?.totalTopics || 0}</Text>
          <Text className={classes.statSubtext} c="dimmed">
            {replacePlaceholder(str('oldDataWarning'), '{count}', (status?.oldTopics || 0).toString())}
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
            <Text className={classes.statLabel}>{str('totalFiles')}</Text>
            <TbFile size={20} className={classes.statIcon} />
          </Group>
          <Text className={classes.statValue}>{status?.totalAssets || 0}</Text>
          <Text className={classes.statSubtext} c="dimmed">
            {replacePlaceholder(str('oldAssetsWarning'), '{count}', (status?.oldAssets || 0).toString())}
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
            <Text className={classes.statLabel}>{str('estimatedSpace')}</Text>
            <TbChartBar size={20} className={classes.statIcon} />
          </Group>
          <Text className={classes.statValue}>{formatBytes(status?.estimatedSpace || 0)}</Text>
          <Text className={classes.statSubtext} c="dimmed">
            {str('canBeFreed')}
          </Text>
        </Card>

        <Card className={classes.statCard} padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text className={classes.statLabel}>{str('lastCleanup')}</Text>
            <TbClock size={20} className={classes.statIcon} />
          </Group>
          <Text className={classes.statValue} size="lg">
            {formatTime(status?.lastCleanupTime)}
          </Text>
          <Text className={classes.statSubtext} c="dimmed">
            {replacePlaceholder(str('autoCleanupStatus'), '{enabled}', config.cleanupEnabled ? str('enabled') : str('disabled'))}
          </Text>
        </Card>
      </div>

      <div className={classes.actionsSection}>
        <Card className={classes.actionCard} padding="lg" radius="md" withBorder>
          <div className={classes.actionHeader}>
            <TbTrash size={24} className={classes.actionIcon} />
            <div>
              <Text className={classes.actionTitle}>{str('manualCleanup')}</Text>
              <Text className={classes.actionSubtitle}>
                {replacePlaceholder(str('cleanupDescription'), '{days}', config.messageRetentionDays.toString())}
              </Text>
            </div>
          </div>
          
          <div className={classes.actionConfig}>
            <Group justify="space-between">
              <div>
                <Text size="sm" fw="500">{str('messageRetention')}</Text>
                <Text size="xs" c="dimmed">{str('messageRetentionDesc')}</Text>
              </div>
              <Badge size="lg" variant="light">{config.messageRetentionDays} {str('days')}</Badge>
            </Group>
            
            <Group justify="space-between" mt="md">
              <div>
                <Text size="sm" fw="500">{str('assetRetention')}</Text>
                <Text size="xs" c="dimmed">{str('assetRetentionDesc')}</Text>
              </div>
              <Badge size="lg" variant="light">{config.assetRetentionDays} {str('days')}</Badge>
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
              {str('preview')}
            </Button>
            <Button 
              variant="filled" 
              color="red"
              leftSection={<TbTrash size={16} />}
              onClick={confirmCleanup}
              loading={cleaning}
            >
              {str('cleanupNow')}
            </Button>
          </Group>
        </Card>

        <Card className={classes.infoCard} padding="lg" radius="md" withBorder>
          <div className={classes.infoHeader}>
            <TbSettings size={20} className={classes.infoIcon} />
            <Text className={classes.infoTitle}>{str('autoCleanup')}</Text>
          </div>
          
          <div className={classes.infoContent}>
            <Group justify="space-between" mb="md">
              <Text size="sm">{str('enableAutoCleanup')}</Text>
              <Switch 
                checked={config.cleanupEnabled}
                onChange={(e) => setConfigState({ ...config, cleanupEnabled: e.currentTarget.checked })}
              />
            </Group>
            
            {config.cleanupEnabled && (
              <>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">{str('cleanupInterval')}</Text>
                  <Text size="sm" fw="500">
                    {config.cleanupIntervalHours} {str('hours')}
                  </Text>
                </Group>
                
                <Text size="xs" c="dimmed" mt="xs">
                  {str('autoCleanupNote')}
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
            {str('saveSettings')}
          </Button>
        </Card>
      </div>

      <Modal 
        opened={settingsOpened} 
        onClose={cleanupClose} 
        title={str('cleanupSettings')}
        size="md"
      >
        <Stack gap="md">
          <div>
            <Switch 
              label={str('enableAutoCleanup')}
              description={str('enableAutoCleanupDesc')}
              checked={config.cleanupEnabled}
              onChange={(e) => setConfigState({ ...config, cleanupEnabled: e.currentTarget.checked })}
            />
          </div>
          
          <NumberInput
            label={str('cleanupInterval')}
            description={str('cleanupIntervalDesc')}
            value={config.cleanupIntervalHours}
            onChange={(val) => setConfigState({ ...config, cleanupIntervalHours: Number(val) || 24 })}
            min={1}
            max={8760}
            suffix={` ${str('hours')}`}
          />
          
          <NumberInput
            label={str('messageRetentionDays')}
            description={str('messageRetentionDaysDesc')}
            value={config.messageRetentionDays}
            onChange={(val) => setConfigState({ ...config, messageRetentionDays: Number(val) || 90 })}
            min={1}
            max={3650}
            suffix={` ${str('days')}`}
          />
          
          <NumberInput
            label={str('assetRetentionDays')}
            description={str('assetRetentionDaysDesc')}
            value={config.assetRetentionDays}
            onChange={(val) => setConfigState({ ...config, assetRetentionDays: Number(val) || 180 })}
            min={1}
            max={3650}
            suffix={` ${str('days')}`}
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={cleanupClose}>
              {str('cancel')}
            </Button>
            <Button variant="filled" onClick={saveConfig} loading={loading}>
              {str('save')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal 
        opened={statusOpened} 
        onClose={statusClose} 
        title={str('cleanupPreview')}
        size="md"
      >
        {cleanupResult && (
          <Stack gap="md">
            <Card withBorder padding="md" radius="md">
              <Text fw="500" mb="sm">{str('estimatedCleanup')}</Text>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">{str('willDeleteMessages')}:</Text>
                  <Badge color="red">{cleanupResult.deletedTopics}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{str('willDeleteFiles')}:</Text>
                  <Badge color="orange">{cleanupResult.deletedAssets}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{str('willFreeSpace')}:</Text>
                  <Badge color="green">{formatBytes(cleanupResult.freedBytes)}</Badge>
                </Group>
              </Stack>
            </Card>
            
            <Alert icon={<TbAlertTriangle size={16} />} color="yellow">
              {str('previewNote')}
            </Alert>
            
            <Group justify="flex-end">
              <Button variant="default" onClick={statusClose}>
                {str('close')}
              </Button>
              <Button 
                variant="filled" 
                color="red"
                onClick={() => {
                  statusClose()
                  confirmCleanup()
                }}
              >
                {str('executeCleanup')}
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

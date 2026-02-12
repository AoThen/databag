import { DatabagSDK, type Params } from 'databag-client-sdk';

interface BotConfig {
  node: string
  secure: boolean
  token: string
}

const config: BotConfig = {
  node: process.env.DATABAG_NODE || '',
  secure: process.env.DATABAG_SECURE === 'true',
  token: process.env.DATABAG_TOKEN || ''
}

const run = async () => {
  try {
    if (!config.node || !config.token) {
      throw new Error('Missing required environment variables: DATABAG_NODE, DATABAG_TOKEN')
    }

    const params: Params = { channelTypes: ['post'] }
    const sdk = new DatabagSDK(params)
    const bot = await sdk.automate(config.node, config.secure, config.token)
    
    console.log('Bot connected successfully')
    
    // 设置消息回调
    bot.setCallback((topic: unknown) => {
      console.log('Received topic:', topic)
    })
    
  } catch (error) {
    console.error('[Bot] Fatal error:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...')
  process.exit(0)
})

run()
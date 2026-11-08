import { app } from 'electron'
import AutoLaunch from 'auto-launch'

const launcher = new AutoLaunch({ name: 'Adobe RPC', path: process.execPath })

export async function setAutoLaunch(on: boolean): Promise<void> {
  if (!app.isPackaged) return
  try {
    const current = await launcher.isEnabled()
    if (on && !current) await launcher.enable()
    if (!on && current) await launcher.disable()
  } catch (err) {
    console.error('autolaunch:', err)
  }
}

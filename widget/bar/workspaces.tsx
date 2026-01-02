import { Gdk } from "ags/gtk4"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import { createBinding, createComputed, For, With } from "ags"

type Props = {
  gdkmonitor: Gdk.Monitor
}

export default function Workspaces({ gdkmonitor }: Props) {
  const hyprland = AstalHyprland.get_default()

  const currentMonitor = hyprland.monitors.find(
    (mon) => mon.name === gdkmonitor.connector
  )

  if (!currentMonitor) {
    throw new Error(`Monitor ${gdkmonitor.connector} not found in Hyprland`)
  }

  const workspaces = createBinding(hyprland, "workspaces")
  const normalWorkspaces = workspaces.as((wss) =>
    wss
      .filter((ws) => ws.id > 0 && ws.monitor.name === currentMonitor.name)
      .sort((a, b) => a.id - b.id)
  )

  const active = createBinding(currentMonitor, "activeWorkspace")
  const special = createBinding(currentMonitor, "specialWorkspace")

  const wsWidth = createComputed(() => normalWorkspaces().length * 36)
  const activeCss = createComputed(
    () =>
      `--move: ${
        normalWorkspaces().findIndex((ws) => ws.id === active()?.id) * 36
      }px;`
  )

  return (
    <box $type="start" class="workspaces">
      <With value={special}>
        {(special) => {
          return (
            <box>
              {special && (
                <Workspace
                  ws={special}
                  label={special.name.replace("special:", "")}
                />
              )}
              <overlay>
                <box $type="overlay">
                  <For each={normalWorkspaces}>
                    {(ws) => {
                      return <Workspace ws={ws} label={ws.name} />
                    }}
                  </For>
                </box>
                <box widthRequest={wsWidth} heightRequest={36}>
                  <box class="active" css={activeCss} widthRequest={36} />
                </box>
              </overlay>
            </box>
          )
        }}
      </With>
    </box>
  )
}

type WorkspaceProps = {
  ws: AstalHyprland.Workspace
  label: string
}

function Workspace({ ws, label }: WorkspaceProps) {
  return (
    <button
      class="workspace"
      heightRequest={24}
      widthRequest={24}
      label={label}
      onClicked={() => {
        ws.focus()
      }}
    />
  )
}

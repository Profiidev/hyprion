import { Gdk, Gtk } from "ags/gtk4"
import AstalHyprland from "gi://AstalHyprland"
import { createBinding, createComputed, For } from "ags"

type Props = {
  gdkmonitor: Gdk.Monitor
  hyprland: AstalHyprland.Hyprland
}

export default function Workspaces({ gdkmonitor, hyprland }: Props) {
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

  const wsWidth = createComputed(() => {
    const normalSize = normalWorkspaces().length * 24 + 12
    const specialSize = (special()?.name ?? "").length * 4 + 4
    return normalSize > specialSize ? normalSize : specialSize
  })
  const activeCss = createComputed(
    () =>
      `
    --move: ${
      special()
        ? 0
        : normalWorkspaces().findIndex((ws) => ws.id === active()?.id) * 24
    }px;
    --width: ${special() ? wsWidth() : 36}px;
      `
  )

  const specialClasses = createComputed(
    () => `special ${special() && "special-active"}`
  )
  const specialLabel = createComputed(
    () => special()?.name.replace("special:", "") || ""
  )
  const specialTarget = createComputed(() => !!special())

  return (
    <overlay class="workspaces">
      <button
        $type="overlay"
        label={specialLabel}
        class={specialClasses}
        canFocus={false}
        halign={Gtk.Align.CENTER}
        widthRequest={wsWidth}
        canTarget={specialTarget}
      />
      <overlay>
        <box $type="overlay">
          <For each={normalWorkspaces}>
            {(ws) => {
              const widthCss = createComputed(() => {
                const width = active()?.id === ws.id ? 36 : 24
                return `--width: ${width}px;`
              })

              return (
                <button
                  class="workspace"
                  label={ws.name}
                  css={widthCss}
                  canFocus={false}
                  onClicked={() => {
                    ws.focus()
                  }}
                />
              )
            }}
          </For>
        </box>
        <box widthRequest={wsWidth} heightRequest={20}>
          <box class="active" css={activeCss} />
        </box>
      </overlay>
    </overlay>
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
      label={label}
      onClicked={() => {
        ws.focus()
      }}
    />
  )
}

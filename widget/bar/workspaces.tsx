import { Gdk, Gtk } from "ags/gtk4"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import { createBinding, For, With } from "ags"

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

  return (
    <box $type="start">
      <With value={special}>
        {(special) => {
          return (
            <box>
              <With value={active}>
                {(active) => {
                  return (
                    <box
                      $type="start"
                      class="workspaces"
                      orientation={Gtk.Orientation.HORIZONTAL}
                    >
                      <For each={normalWorkspaces}>
                        {(ws) => {
                          const isActive = ws.id === active.id
                          const label = special
                            ? special.name.replace("special:", "")
                            : ws.name

                          return (
                            <centerbox
                              heightRequest={24}
                              widthRequest={isActive ? 48 : 36}
                              class={"workspace " + (isActive && "active")}
                            >
                              <label
                                $type="center"
                                label={label}
                                class="text"
                              />
                            </centerbox>
                          )
                        }}
                      </For>
                    </box>
                  )
                }}
              </With>
            </box>
          )
        }}
      </With>
    </box>
  )
}

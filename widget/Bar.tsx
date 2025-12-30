import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"
import AstalNotifd from "gi://AstalNotifd"
import { createBinding, createComputed, onCleanup } from "ags"
import AstalHyprland from "gi://AstalHyprland"

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const time = createPoll("", 1000, "date")
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  const notifd = AstalNotifd.get_default()
  const hyprland = AstalHyprland.get_default()

  const monitors = createBinding(hyprland, "monitors")
  const currentMonitor = monitors.as(
    (mons) => mons.find((mon) => mon.name === gdkmonitor.connector)!
  )
  const activeWorkspace = currentMonitor.as((mon) => mon.activeWorkspace)
  const specialWorkspace = currentMonitor.as((mon) => mon.specialWorkspace)

  activeWorkspace.subscribe(() => {
    console.log("Active workspace changed:", activeWorkspace.peek().name)
  })
  specialWorkspace.subscribe(() => {
    console.log("Special workspace changed:", specialWorkspace.peek().name)
  })

  const workspaces = createBinding(hyprland, "workspaces")
  const normalWorkspaces = workspaces.as((wss) =>
    wss.filter((ws) => ws.id > 0).sort((a, b) => a.id - b.id)
  )
  const specialWorkspaces = workspaces.as((wss) =>
    wss.filter((ws) => ws.id < 0).sort((a, b) => a.id - b.id)
  )
  normalWorkspaces.subscribe(() => {
    console.log(
      "Normal workspaces changed:",
      normalWorkspaces.peek().map((ws) => ws.name)
    )
  })
  specialWorkspaces.subscribe(() => {
    console.log(
      "Special workspaces changed:",
      specialWorkspaces.peek().map((ws) => ws.name)
    )
  })

  const notifiedHandler = notifd.connect("notified", (source, id, replaced) => {
    console.log("Notification received:", { source, id, replaced })
  })

  onCleanup(() => {
    notifd.disconnect(notifiedHandler)
  })

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <box
          $type="start"
          class="workspaces"
          orientation={Gtk.Orientation.HORIZONTAL}
        >
          <label label="Test" class="workspace" />
        </box>
      </centerbox>
    </window>
  )
}

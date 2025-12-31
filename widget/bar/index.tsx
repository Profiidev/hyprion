import { Astal, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Workspaces from "./workspaces"

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

export default function Bar(gdkmonitor: Gdk.Monitor) {
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
        <Workspaces gdkmonitor={gdkmonitor} />
      </centerbox>
    </window>
  )
}

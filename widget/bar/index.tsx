import { Astal, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Workspaces from "./workspaces"
import AstalHyprland from "gi://AstalHyprland"
import Focus from "./focus"
import Media from "./media"

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

const hyprland = AstalHyprland.get_default()

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
        <box $type="start">
          <Workspaces gdkmonitor={gdkmonitor} hyprland={hyprland} />
          <Focus hyprland={hyprland} />
        </box>
        <box $type="center">
          <Media />
          <box widthRequest={400} />
        </box>
      </centerbox>
    </window>
  )
}

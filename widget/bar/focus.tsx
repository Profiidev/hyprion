import AstalHyprland from "gi://AstalHyprland"
import Apps from "gi://AstalApps"
import { createBinding, createComputed } from "ags"

type Props = {
  hyprland: AstalHyprland.Hyprland
}

const apps = new Apps.Apps({
  nameMultiplier: 2,
  entryMultiplier: 2,
  executableMultiplier: 2,
})

export default function Focus({ hyprland }: Props) {
  const client = createBinding(hyprland, "focusedClient")
  const clientName = createComputed(() => {
    const className = client()?.class
    if (!className) return "?"

    const appInfos = apps.fuzzy_query(className)[0]
    return appInfos ? appInfos.name : "?"
  })
  const clientDetail = createComputed(() => {
    let title = client()?.title || ""

    if (title.endsWith(` - ${clientName()}`)) {
      title = title.slice(0, title.length - clientName().length - 3)
    } else if (title.endsWith(clientName())) {
      title = title.slice(0, title.length - clientName().length)
    }

    return title
  })

  return (
    <box class="focus">
      <label label={clientName} />
      <label label="•" class="spacer" />
      <label class="detail" label={clientDetail} />
    </box>
  )
}

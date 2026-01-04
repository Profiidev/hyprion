import AstalHyprland from "gi://AstalHyprland"
import Apps from "gi://AstalApps"
import { createBinding, createComputed, createState } from "ags"
import Pango from "gi://Pango"

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
  let [clientTitle, setClientTitle] = createState(hyprland.focusedClient?.title)
  let [clientClass, setClientClass] = createState(hyprland.focusedClient?.class)
  let clientTitleUnsub = () => {}
  let clientClassUnsub = () => {}

  const updateClientBindings = () => {
    let c = client()
    let bindingTitle = createBinding(c, "title")
    let bindingClass = createBinding(c, "class")

    clientTitleUnsub()
    clientClassUnsub()

    clientTitleUnsub = bindingTitle.subscribe(() => {
      setClientTitle(bindingTitle())
    })
    clientClassUnsub = bindingClass.subscribe(() => {
      setClientClass(bindingClass())
    })

    setClientTitle(bindingTitle())
    setClientClass(bindingClass())
  }

  client.subscribe(updateClientBindings)
  updateClientBindings()

  const clientName = createComputed(() => {
    const className = clientClass()
    if (!className) return "?"

    const appInfos = apps.fuzzy_query(className)[0]
    return appInfos ? appInfos.name : "?"
  })
  const clientDetail = createComputed(() => {
    let title = clientTitle() || ""

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
      <label
        class="detail"
        label={clientDetail}
        ellipsize={Pango.EllipsizeMode.END}
        maxWidthChars={32}
      />
    </box>
  )
}

import AstalHyprland from "gi://AstalHyprland"
import Apps from "gi://AstalApps"
import { createBinding, createComputed, createState, With } from "ags"
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
  const workspace = createBinding(hyprland, "focusedWorkspace")
  let [clientTitle, setClientTitle] = createState<string | undefined>(
    hyprland.focusedClient?.title
  )
  let [clientClass, setClientClass] = createState<string | undefined>(
    hyprland.focusedClient?.class
  )
  let clientTitleUnsub = () => {}
  let clientClassUnsub = () => {}

  const updateClientBindings = () => {
    let c = client()
    if (!c) {
      setClientTitle(undefined)
      setClientClass(undefined)
      return
    }

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
    if (!className) return ""

    const workspaceId = workspace()?.id
    const clientWorkspace = client()?.workspace?.id
    // focusedClient is not null when focusing an empty workspace
    // special workspaces don't affect the focused workspace so we can't apply this logic there
    if (
      workspaceId !== clientWorkspace &&
      clientWorkspace > 0 &&
      clientWorkspace
    )
      return ""

    const appInfos = apps.fuzzy_query(className)[0]
    return appInfos ? appInfos.name : ""
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
    <With value={clientName}>
      {(name) => {
        return name ? (
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
        ) : (
          <box></box>
        )
      }}
    </With>
  )
}

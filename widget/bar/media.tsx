import AstalMpris from "gi://AstalMpris"
import { createBinding } from "ags"
import AstalCava from "gi://AstalCava"

const mpris = AstalMpris.get_default()
const cava = AstalCava.get_default()
cava?.set_bars(8)

export default function Media() {
  const players = createBinding(mpris, "players")
  players.subscribe(() => {
    console.log("MPRIS players updated:", players()[0].volume, players())
  })
  return <box>Media</box>
}

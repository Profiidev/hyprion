import AstalMpris from "gi://AstalMpris"
import { createBinding, createComputed, createState } from "ags"
import AstalCava from "gi://AstalCava"
import Pango from "gi://Pango"

const mpris = AstalMpris.get_default()
const cava = AstalCava.get_default()
cava?.set_bars(8)

export default function Media() {
  const players = createBinding(mpris, "players")
  const activePlayer = createComputed(() => {
    const ps = players()
    const playing = ps.find(
      (p) => p.playback_status === AstalMpris.PlaybackStatus.PLAYING
    )
    if (playing) {
      return playing
    }
    return ps[0]
  })

  let [label, setLabel] = createState("")
  let [artist, setArtist] = createState("")
  let [playing, setPlaying] = createState(false)

  let labelUnsub = () => {}
  let artistUnsub = () => {}
  let playingUnsub = () => {}

  const updatePlayerBindings = () => {
    const player = activePlayer()
    if (!player) {
      setLabel("")
      setArtist("")
      setPlaying(false)
      return
    }

    const bindingLabel = createBinding(player, "title")
    const bindingArtist = createBinding(player, "artist")
    const bindingPlaying = createBinding(player, "playback_status")

    labelUnsub()
    artistUnsub()
    playingUnsub()

    labelUnsub = bindingLabel.subscribe(() => {
      setLabel(bindingLabel())
    })
    artistUnsub = bindingArtist.subscribe(() => {
      setArtist(bindingArtist())
    })
    playingUnsub = bindingPlaying.subscribe(() => {
      setPlaying(bindingPlaying() === AstalMpris.PlaybackStatus.PLAYING)
    })

    setLabel(bindingLabel())
    setArtist(bindingArtist())
    setPlaying(bindingPlaying() === AstalMpris.PlaybackStatus.PLAYING)
  }

  players.subscribe(updatePlayerBindings)
  updatePlayerBindings()

  const iconName = createComputed(() => {
    return playing() ? "media-playback-pause" : "media-playback-start"
  })
  const combinedLabel = createComputed(() => {
    const lbl = label()
    const art = artist()
    if (lbl && art) {
      return `${lbl} • ${art}`
    }
    return lbl || art || ""
  })

  return (
    <box class="media">
      <box class="media-bars">
        <box class="media-bar" />
        <box class="media-bar" />
        <box class="media-bar" />
        <box class="media-bar" />
        <box class="media-bar" />
      </box>
      <label
        class="media-label"
        label={combinedLabel}
        ellipsize={Pango.EllipsizeMode.MIDDLE}
        maxWidthChars={16}
      />
      <button
        iconName="media-skip-backward"
        canFocus={false}
        onClicked={() => {
          const player = activePlayer()
          player?.previous()
        }}
      />
      <button
        class="media-play"
        iconName={iconName}
        canFocus={false}
        onClicked={() => {
          const player = activePlayer()
          player?.play_pause()
        }}
      />
      <button
        iconName="media-skip-forward"
        canFocus={false}
        onClicked={() => {
          const player = activePlayer()
          player?.next()
        }}
      />
    </box>
  )
}

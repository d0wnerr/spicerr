const ICON_SVG = `<svg data-slot="icon" fill="none" stroke-width="1.5"
stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round"
d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467
l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632
2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z">
</path></svg>`;

async function main() {
  const { Platform, ContextMenu, URI } = Spicetify;
  if (!(Platform && URI)) {
    setTimeout(main, 300);
    return;
  }
  
  async function getTrackInfoFromURI(uri) {
    const id = Spicetify.URI.from(uri);
    const hex = Spicetify.URI.idToHex(id.id);
    const response = await Spicetify.Platform.RequestBuilder.build()
      .withHost("https://spclient.wg.spotify.com/metadata/4")
      .withPath(`/${id.type}/${hex}`)
      .send();
    const data = response.body;
    if (Spicetify.URI.isTrack(uri)) {
      return {
        type: id.type,
        name: data.name,
        artist: data.artist?.[0]?.name || "",
        album: data.album?.name || "",
      };
    }

    if (Spicetify.URI.isArtist(uri)) {
      return {
        type: id.type,
        artist: data.name,
      };
    }
  }

  async function findTabs(uris) {
    const uri = uris[0];
    const info = await getTrackInfoFromURI(uri);
    if (!info) return;

    console.log(info.name, info.artist, info.album);

    let url;
    let noti;
    if (info.type === "track") {
      url = `https://www.songsterr.com/a/wa/bestMatchForQueryString?s=${encodeURIComponent(info.name)}&a=${encodeURIComponent(info.artist)}`;
      noti = `Opening tab for ${info.name} - ${info.artist}`;
    } else {
      url = `https://www.songsterr.com/?pattern=${encodeURIComponent(info.artist)}`;
      noti = `Searching for tabs by ${info.artist}`;
    }

    console.log("Opening Songsterr URL", url);
    Spicetify.showNotification(noti);
    open(url);
  }

  const shouldDisplayContextMenu = (uris) => {
    if (uris.length > 1) return false;
    const uriObj = Spicetify.URI.fromString(uris[0]);
    return (uriObj.type === Spicetify.URI.Type.TRACK || uriObj.type === Spicetify.URI.Type.ARTIST);
  }

  new ContextMenu.Item(
    "Find Songsterr Tabs",
    findTabs,
    shouldDisplayContextMenu,
    ICON_SVG
  ).register();
}

export default main;

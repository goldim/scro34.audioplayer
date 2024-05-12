/* ************************************************************************

   Copyright:
     2015-2021 Norbert Schröder

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Norbert Schröder (scro34)
     * Dmitrii Zolotov (goldim)

   Note:
     The Audio Player loads its playlist from a file containing data in
     JSON format. See the accompanying "playlist.json" for information
     about the data structure.
   

************************************************************************ */

qx.Class.define("scro34.audioplayer.Video", {
  extend: scro34.audioplayer.Window,

  members: {
    htmlFrame: null,

    _createControls() {
      const layout = new qx.ui.layout.VBox();
      this.set({
        caption: "Video",
        layout,
        contentPadding: 1,
        allowStretchX: false,
        showMaximize: false,
        showMinimize: false,
        resizable: false,
      });
    },

    __createEmbeded(){
      let decorator = qx.theme.manager.Decoration.getInstance().resolve("theme-demo-input");
      if (!decorator){
        decorator = qx.theme.manager.Decoration.getInstance().resolve("input");
      }
      const html = new qx.ui.embed.Iframe();
      html.set({
        width: 642,
        height: 482,
        decorator: decorator ?? null,
        padding: 0,
      });

      this.add(html, { flex: 1 });
      return html;
    },

    setVideoLink(data) {
      if (!this.htmlFrame){
        this.htmlFrame = this.__createEmbeded(data.url);
      }
      this.htmlFrame.set({ width: data.width + 2, height: data.height + 2 });
      this.htmlFrame.setSource(data.url);
    },

    stopVideo() {
      this.htmlFrame.resetSource();
      this.htmlFrame.reload();
    }
  },
});

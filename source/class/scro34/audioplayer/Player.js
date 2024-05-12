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

qx.Class.define("scro34.audioplayer.Player", {
  extend: qx.ui.window.Window,
  include: [scro34.audioplayer.MLinks],

  construct() {
    super();
    this._createControls();

    this.addListener("beforeMinimize", this._onBeforeMinimize, this);
    this.addListener("beforeMaximize", this._onBeforeMaximize, this);
    this.addListener("close", () => this._audio?.pause());
  },

  events: {
    openHomepage: "qx.event.type.Data",
    openWikipedia: "qx.event.type.Data",
    openVideo: "qx.event.type.Data",
    setVideoData: "qx.event.type.Data",
  },

  properties: {
    playlist: {
      init: "",
      check: "String",
      event: "changePlaylist",
      apply: "_applyPlaylist"
    }
  },

  members: {
    _audio: null,
    _autoChange: false,
    _baseUrl: null,
    _currAlbum: 0,
    _currTime: null,
    _defaultCaption: "Audio Player",
    _maxTime: null,
    _playlistData: null,
    _playlistUrl: null,
    _uri: null,

    _applyPlaylist(url){
      this._playlistUrl = qx.util.ResourceManager.getInstance().toUri(url);
      this._getPlaylist();
    },

    _createControls() {
      this._playlistUrl = qx.util.ResourceManager.getInstance().toUri(this.getPlaylist());

      this.set({
        contentPadding: 2,
        showMaximize: false,
        layout: new qx.ui.layout.VBox(5),
        icon: scro34.audioplayer.IconFactory.getInstance().getIcon("MEDIA_PLAYER_SMALL"),
        caption: this._defaultCaption,
        resizable: false,
      });

      this.add(this._createMainBox());
      this.addListenerOnce("appear", this._onAppear, this);
    },

    _createMainBox() {
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(3));
      container.add(this._createBoxLeft());
      container.add(this._createVolumeControl());
      container.add(this._createBoxRight());
      return container;
    },

    _createBoxLeft() {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
      container.add(this._createAlbumBox());
      container.add(this._createPositionBar());
      container.add(this._createPlayBar());
      return container;
    },

    _createAlbumBox() {
      var albumCover = (this._albumCover = new qx.ui.basic.Image().set({
        width: 200,
        height: 200,
        scale: true,
      }));
      albumCover.addListener("changeSource", this._onChangeSource, this);

      let decorator = qx.theme.manager.Decoration.getInstance().resolve("theme-demo-input");
      if (!decorator){
        decorator = qx.theme.manager.Decoration.getInstance().resolve("input");
      }
      var albumBox = (this._albumBox = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(0)
      ).set({
        decorator: decorator ?? null,
        padding: 5,
      }));

      albumBox.add(albumCover);

      return albumBox;
    },

    _createPositionBar() {
      var positionSlider = (this._positionSlider = new qx.ui.form.Slider().set({
        marginTop: 5,
        marginBottom: -11,
        zIndex: 99,
        decorator: null,
        value: 0,
        enabled: false,
      }));
      positionSlider.addListener("changeValue", this._onChangePosition, this);

      this._positionKnob = positionSlider.getChildControl("knob");
      this._positionKnob.set({
        maxWidth: 20,
        maxHeight: 10,
      });

      var currTime = (this._currTime = new qx.ui.basic.Label("0:00").set({
        font: "small",
        marginTop: 3,
        textColor: "text-selected",
      }));
      var maxTime = (this._maxTime = new qx.ui.basic.Label("0:00").set({
        font: "small",
        marginTop: 3,
        textColor: "text-selected",
      }));

      var innerContainer = new qx.ui.container.Composite(
        new qx.ui.layout.VBox()
      );
      innerContainer.add(positionSlider);
      innerContainer.add(new qx.ui.menu.Separator());

      var container = new qx.ui.container.Composite(
        new qx.ui.layout.HBox(3)
      ).set({
        marginLeft: 3,
      });
      container.add(currTime);
      container.add(innerContainer, { flex: 1 });
      container.add(maxTime);

      return container;
    },

    _createPlayBar() {
      this._ttPlay = new qx.ui.tooltip.ToolTip("Start playback");
      this._ttPause = new qx.ui.tooltip.ToolTip("Pause playback");
      this._ttResume = new qx.ui.tooltip.ToolTip("Resume playback");

      var btnSkipBackward = (this._btnSkipBackward = new scro34.audioplayer.toolbar.Button(
        "MEDIA_PLAYER_SKIP_BACK"
      ).set({
        enabled: false,
        toolTip: new qx.ui.tooltip.ToolTip("Previous song"),
      }));
      btnSkipBackward.addListener("execute", this._onSkipBackward, this);

      var btnSkipForward = (this._btnSkipForward = new scro34.audioplayer.toolbar.Button(
        "MEDIA_PLAYER_SKIP_FORWARD"
      ).set({
        enabled: false,
        toolTip: new qx.ui.tooltip.ToolTip("Next song"),
      }));
      btnSkipForward.addListener("execute", this._onSkipForward, this);

      var btnPlay = (this._btnPlay = new scro34.audioplayer.toolbar.CheckBox(
        "MEDIA_PLAYER_START",
        "MEDIA_PLAYER_PAUSE"
      ).set({
        enabled: false,
        toolTip: this._ttPlay,
      }));
      btnPlay.addListener("changeValue", this._onPlay, this);

      var toolbar = new qx.ui.toolbar.ToolBar().set({
        minWidth: 200,
        marginTop: 0,
        marginRight: 0,
        decorator: null,
      });
      toolbar.addSpacer();
      toolbar.add(btnSkipBackward);
      toolbar.add(btnPlay);
      toolbar.add(btnSkipForward);
      toolbar.addSpacer();

      return toolbar;
    },

    _createVolumeControl() {
      var volumeIcon = (this._volumeIcon = new qx.ui.basic.Image(
        scro34.audioplayer.IconFactory.getInstance().getIcon("MEDIA_PLAYER_LEVEL_50")
      ).set({ enabled: false }));

      var volumeSlider = (this._volumeSlider = new qx.ui.form.Slider(
        "vertical"
      ).set({
        marginLeft: 2,
        minimum: -100,
        maximum: 0,
        value: -50,
        enabled: false,
      }));
      volumeSlider.addListener("changeValue", this._onChangeVolume, this);

      var volumeLabel = (this._volumeLabel = new qx.ui.basic.Label("50").set({
        width: 24,
        textAlign: "center",
        font: "small",
        textColor: "text-selected",
      }));

      var container = (this._volumeControl = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(5).set({
          alignX: "center",
        })
      ).set({
        maxHeight: 213,
      }));
      container.add(volumeLabel);
      container.add(volumeSlider, { flex: 1 });
      container.add(
        new qx.ui.basic.Label("0").set({
          font: "small",
          textColor: "text-selected",
        })
      );
      container.add(volumeIcon);

      return container;
    },

    _createBoxRight() {
      var container = (this._boxRight = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(7)
      ));
      container.add(this._createPlaylist());
      container.add(
        new qx.ui.menu.Separator().set({
          marginTop: 2,
          marginLeft: 5,
          marginBottom: 10,
        })
      );
      container.add(this._createInfoBar());

      return container;
    },

    _createPlaylist() {
      var playlist = (this._playlist = new qx.ui.form.List().set({
        height: 218,
        width: 300,
        margin: [0, 0, 8, 5],
      }));
      playlist.addListener("changeSelection", this._onChangeSelection, this);
      playlist.addListener("dblclick", this._onDblClick, this);

      var emptyList = (this._emptyList = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(5).set({
          alignX: "center",
          alignY: "middle",
        })
      ));
      emptyList.add(new qx.ui.basic.Label("The playlist is empty."));
      emptyList.add(new scro34.audioplayer.Separator(80));

      var playlistContainer = (this._playlistContainer =
        new qx.ui.container.Stack());
      playlistContainer.add(emptyList);
      playlistContainer.add(playlist);

      return playlistContainer;
    },

    _createInfoBar() {
      const icons = scro34.audioplayer.IconFactory.getInstance();
      var btnHomepage = (this._btnHomepage = new scro34.audioplayer.toolbar.Button(
        "GO_HOME"
      ).set({
        enabled: false,
      }));
      btnHomepage.setToolTip(
        new qx.ui.tooltip.ToolTip("Open artist's homepage")
      );
      btnHomepage.addListener("execute", () => {
        this.fireDataEvent("openHomepage", {
          caption: this._playlistData[this._currAlbum].artist + " :: Homepage",
          url: this._playlistData[this._currAlbum].homepage,
          icon: icons.getIcon("GO_HOME_HOVER"),
        });
      });

      var btnWikipedia = (this._btnWikipedia = new scro34.audioplayer.toolbar.Button(
        "WIKIPEDIA"
      ).set({
        enabled: false,
      }));
      btnWikipedia.setToolTip(
        new qx.ui.tooltip.ToolTip("Open Wikipedia article on this artist/band")
      );
      btnWikipedia.addListener("execute", () => {
        this.fireDataEvent("openWikipedia", {
          caption: this._playlistData[this._currAlbum].artist + " :: Wikipedia",
          url: this._playlistData[this._currAlbum].wikipedia,
          icon: icons.getIcon("WIKIPEDIA_HOVER")
        });
      });

      var btnVideo = (this._btnVideo = new scro34.audioplayer.toolbar.Button(
        "YOUTUBE"
      ).set({
        enabled: false,
      }));
      btnVideo.setToolTip(
        new qx.ui.tooltip.ToolTip("Watch this artist/band on YouTube")
      );
      btnVideo.addListener("execute", () => {
        this.fireDataEvent("openVideo", {
          caption:
            this._playlistData[this._currAlbum].artist +
            " :: " +
            this._playlistData[this._currAlbum].video.title,
          video: this._playlistData[this._currAlbum].video,
          icon: icons.getIcon("YOUTUBE_HOVER"),
        });
      });

      var toolbar = (this.infoBar = new qx.ui.toolbar.ToolBar().set({
        decorator: null,
      }));
      toolbar.addSpacer();
      toolbar.add(btnHomepage);
      toolbar.add(btnWikipedia);
      toolbar.add(btnVideo);
      toolbar.addSpacer();

      return toolbar;
    },

    _getPlaylist() {
      var req = new qx.io.request.Xhr(this._playlistUrl);
      req.setParser("json");
      req.addListener("success", () => {
        this._baseUrl = req.getResponse().baseUrl;
        this._playlistData = req.getResponse().playlistData;
        if (this._playlistData && this._playlistData[0].artist) {
          this._playlistContainer.setSelection([this._setAlbumData()]);
        } else {
          this._playlistContainer.setSelection([this._emptyList]);
        }
      });
      req.send();
    },

    _setAlbumData() {
      var albumInfo, playlistItem;

      for (var i = 0; i < this._playlistData.length; i++) {
        albumInfo = this._playlistData[i];
        playlistItem = new qx.ui.form.ListItem(
          "<b>" + albumInfo.artist + "</b>" + " &ndash; " + albumInfo.title
        ).set({
          rich: true,
          toolTip: new qx.ui.tooltip.ToolTip(
            "Original length: " + albumInfo.duration
          ),
        });
        this._playlist.add(playlistItem);
      }

      this._setAlbumInfo(this._playlistData[0]);

      if (qx.core.Environment.get("html.audio.mp3") && !this._audio) {
        this._uri = qx.util.ResourceManager.getInstance().toUri(
          this._baseUrl + albumInfo.file
        );
        this._audio = new qx.bom.media.Audio(this._uri).set({ volume: 0.5 });
        this._audio.addListener("loadeddata", this._onLoadedData, this);
        this._audio.addListener("timeupdate", this._onTimeUpdate, this);
        this._audio.addListener("ended", this._onSkipForward, this);

        this._positionSlider.setEnabled(true);
        this._volumeSlider.setEnabled(true);
        this._volumeIcon.setEnabled(true);
      }

      return this._playlist;
    },

    _setAlbumInfo(albumInfo) {
      this.setCaption(albumInfo.artist + " - " + albumInfo.title);
      this._albumCover.setSource(this._baseUrl + albumInfo.albumCover);

      this._btnSkipBackward.setEnabled(true);
      this._btnPlay.setEnabled(true);
      this._btnSkipForward.setEnabled(true);

      this._btnHomepage.setEnabled(albumInfo.homepage > "");
      this._btnWikipedia.setEnabled(albumInfo.wikipedia > "");
      this._btnVideo.setEnabled(albumInfo.video > "");
    },

    _playSong() {
      var albumInfo = this._playlistData[this._currAlbum];
      this._setAlbumInfo(albumInfo);

      if (this._audio) {
        this._uri = qx.util.ResourceManager.getInstance().toUri(
          this._baseUrl + albumInfo.file
        );
        this._playlist.setSelection([
          this._playlist.getSelectables()[this._currAlbum],
        ]);

        if (
          this._uri.split("/").pop() != this._audio.getSource().split("/").pop()
        ) {
          this._audio.setSource(this._uri);
        }

        if (this._btnPlay.getValue()) {
          this._audio.play();
        }
      }
    },

    _formatTime(time) {
      var hour = Math.floor(time / 60);
      var sec = parseInt(time % 60);

      return hour + ":" + (sec > 9 ? sec : "0" + sec);
    },

    _onAppear() {
      this.fadeIn(250);
    },

    _onBeforeMinimize(e) {
      this._boxRight.setVisibility("excluded");
      this._volumeControl.setVisibility("excluded");
      this._albumBox.setVisibility("excluded");
      this.setShowMinimize(false);
      this.setShowMaximize(true);
      this.setAlwaysOnTop(true);
      e.stop();
    },

    _onBeforeMaximize(e) {
      this._boxRight.setVisibility("visible");
      this._volumeControl.setVisibility("visible");
      this._albumBox.setVisibility("visible");
      this.setShowMinimize(true);
      this.setShowMaximize(false);
      this.setAlwaysOnTop(false);
      e.stop();
    },

    _onLoadedData() {
      var duration = this._audio.getDuration();

      this._maxTime.setValue(this._formatTime(duration));
      this._positionSlider.setMaximum(Math.round(duration));
    },

    _onChangeSelection() {
      this._currAlbum = this._playlist.indexOf(
        this._playlist.getSelection()[0]
      );
      this._playSong();
    },

    _onDblClick() {
      this._btnPlay.setValue(true);
    },

    _onChangeSource() {
      var tooltip =
        this._playlistData[this._currAlbum].artist +
        " :: " +
        this._playlistData[this._currAlbum].album;

      this._albumCover.setToolTip(new qx.ui.tooltip.ToolTip(tooltip));
    },

    _onPlay(e) {
      var pressed = e.getData();
      if (pressed) {
        this._btnPlay.play();
        this._playSong(false);
        let decorator = qx.theme.manager.Decoration.getInstance().resolve("slider-knob-hovered");
        if (decorator){
          this._positionKnob.setDecorator(decorator);
        }
        this._btnPlay.setToolTip(this._ttPause);
      } else {
        this._btnPlay.pause();
        this._audio.pause();
        let decorator = qx.theme.manager.Decoration.getInstance().resolve("slider-knob");
        if (decorator){
          this._positionKnob.setDecorator(decorator);
        }
        this._btnPlay.setToolTip(this._ttResume);
      }
    },

    _onTimeUpdate() {
      var currentTime = this._audio.getCurrentTime();

      this._autoChange = true;
      this._positionSlider.setValue(Math.round(currentTime));
      this._currTime.setValue(this._formatTime(currentTime));
      this._autoChange = false;
    },

    _onChangePosition(e) {
      if (!this._autoChange) {
        this._audio.setCurrentTime(e.getData());
      }
    },

    _onSkipForward() {
      this._currAlbum =
        this._currAlbum < this._playlistData.length - 1
          ? this._currAlbum + 1
          : 0;
      this._playlist.setSelection([
        this._playlist.getSelectables()[this._currAlbum],
      ]);
    },

    _onSkipBackward() {
      this._currAlbum =
        this._currAlbum > 0
          ? this._currAlbum - 1
          : this._playlistData.length - 1;
      this._playlist.setSelection([
        this._playlist.getSelectables()[this._currAlbum],
      ]);
    },

    _onChangeVolume(e) {
      var volume = e.getData() * -1;
      this._audio.setVolume(volume / 100);
      this._volumeLabel.setValue(String(volume));

      var currIcon = this._volumeIcon.getSource();
      const icons = scro34.audioplayer.IconFactory.getInstance();
      var statusIcon = "MEDIA_PLAYER_LEVEL_00";

      switch (true) {
        case volume == 100:
          statusIcon = "MEDIA_PLAYER_LEVEL_100";
          break;

        case volume >= 66:
          statusIcon = "MEDIA_PLAYER_LEVEL_75";
          break;

        case volume >= 33:
          statusIcon = "MEDIA_PLAYER_LEVEL_50";
          break;

        case volume > 0:
          statusIcon = "MEDIA_PLAYER_LEVEL_25";
          break;
      }
      if (statusIcon != currIcon) {
        var icon = icons.getIcon(statusIcon);
        this._volumeIcon.setSource(icon);
      }
    },
  },
});

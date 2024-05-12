/* ************************************************************************

   qooxdoo - the new era of web development

   https://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * ???
     * Dmitrii Zolotov

************************************************************************ */

qx.Class.define("scro34.audioplayer.WebBrowser", {
  extend: scro34.audioplayer.Window,

  construct() {
    super();
    this.setCaption("Web Browser");
    this.__history = [];
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    iframe: null,
    txtUrl: "",

    _createControls() {
      var layout = new qx.ui.layout.VBox(0);
      this.set({
        layout: layout,
        width: 900,
        height: 700,
        contentPadding: 0,
        icon: scro34.audioplayer.IconFactory.getInstance().getIcon("WEB_BROWSER_SMALL"),
      });

      var toolbar = this._createToolbar();
      this.iframe = new qx.ui.embed.Iframe()
      this.iframe.addListener("load", function(e){
        console.log(this.iframe.getContentElement().getDocument());
        // const uri = qx.util.Uri.parseUri(this.iframe.getSource());
        // console.log(uri.source);
        // this.__history.push(uri);
        // this.txtUrl.setValue(uri.source);
      }, this);
      // .set({
      //   scrollbarY: "on",
      //   scrollbarX: "on",
      // });

      this.add(toolbar);
      this.add(this.iframe, { flex: 1 });

      this.addListenerOnce("appear", this._onAppear, this);
    },

    _createToolbar() {
      var toolbar = new qx.ui.toolbar.ToolBar();

      var btnBack = new scro34.audioplayer.toolbar.Button(
        "WEB_BROWSER_PREVIOUS"
      );
      btnBack.addListener("execute", (e) => {
        this.__history.pop();
        const link = this.__history.pop();
        this.surfTo(link.source);
      });
      toolbar.add(btnBack);
      var btnForward = new scro34.audioplayer.toolbar.Button(
        "WEB_BROWSER_NEXT"
      );
      btnForward.addListener("execute", (e) => {
        // this.iframe.getWindow().history.forward();
      });
      toolbar.add(btnForward); // IE does not allow access to an iframes history object
      // Firefox applies history changes to the main window
      // Opera throws a script error when trying to go forward or back
      btnForward.setToolTipText("This feature is currently not supported.");
      btnBack.setToolTipText("This feature is currently not supported.");
      this.txtUrl = new qx.ui.form.TextField().set({
        marginLeft: 1,
        value: "https://qooxdoo.org",
        padding: 2,
        alignY: "middle",
      });
      this.txtUrl.addListener("keypress", (e) => {
        if (e.getKeyIdentifier() == "Enter") {
          const newUrl = this.txtUrl.getValue();
          const newUri = qx.util.Uri.parseUri(newUrl);

          const current = this.__history.pop();
          if (current.host !== newUri.host || current.protocol !== newUri.protocol){
            this.remove(this.iframe);
            this.iframe = new qx.ui.embed.Iframe()
            this.add(this.iframe, { flex: 1 });
          }
          this.surfTo(this.txtUrl.getValue());
        }
      });
      toolbar.add(this.txtUrl, { flex: 1 });

      var btnGo = new scro34.audioplayer.toolbar.Button(
        "WEB_BROWSER_GO"
      );
      btnGo.addListener("execute", (e) => {
        this.surfTo(this.txtUrl.getValue());
      });
      toolbar.add(btnGo);

      return toolbar;
    },

    surfTo(url) {
      const uri = qx.util.Uri.parseUri(url);
      var hasHttp = ["http", "https"].includes(uri.protocol);
      if (!hasHttp) {
        url = "https://" + url;
      }
      this.__history.push(uri);
      this.txtUrl.setValue(url);
      this.iframe.setSource(url);
    },

    _onAppear() {
      this.surfTo(this.txtUrl.getValue());
    },
  },
});

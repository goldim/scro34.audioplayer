/* ************************************************************************

   Copyright: 2024 undefined

   License: MIT license

   Authors: undefined

************************************************************************ */

/**
 * This is the main application class of "scro34.audioplayer"
 * 
 * @asset(scro34/audioplayer/playlist.json)
 */
qx.Class.define("scro34.audioplayer.demo.Application",
{
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main()
    {
      // Call super class
      super.main();

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      const player = new scro34.audioplayer.Player();
      const desktop = new qx.ui.window.Desktop(new qx.ui.window.Manager());
      this.getRoot().add(desktop, { top: 0, left: 0, bottom: 0, right: 0 });
      desktop.add(player);
      player.setDesktop(desktop);
      player.setPlaylist("scro34/audioplayer/playlist.json");
      player.setCenterOnAppear(true);
      player.open();
    }
  }
});

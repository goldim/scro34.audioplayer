/* ************************************************************************

   Copyright:
     2015-2024 Norbert Schröder

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Norbert Schröder (scro34)
     * Dmitrii Zolotov (goldim)

************************************************************************ */

qx.Class.define("scro34.audioplayer.Separator", {
  extend: qx.ui.container.Composite,

  construct(width) {
    super();

    var layout = new qx.ui.layout.HBox(5).set({
      alignX: "center",
      alignY: "middle",
    });

    this.set({
      layout: layout,
    });

    this.add(
      new qx.ui.menu.Separator().set({
        width: width,
        maxHeight: 2,
      })
    );

    let decorator = qx.theme.manager.Decoration.getInstance().resolve("theme-demo-title-separator");
    if (!decorator){
      decorator = qx.theme.manager.Decoration.getInstance().resolve("radiobutton");
    }
    this.add(
      new qx.ui.basic.Atom().set({
        decorator:  decorator ?? null,
        width: 15,
        height: 15,
        maxHeight: 15,
        marginBottom: 3,
      })
    );

    this.add(
      new qx.ui.menu.Separator().set({
        width: width,
        maxHeight: 2,
      })
    );
  },
});

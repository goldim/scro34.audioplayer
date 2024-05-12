/* ************************************************************************

   Copyright:
     2015 Norbert Schröder, http://scro34.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Norbert Schröder (scro34)

************************************************************************ */

qx.Class.define("scro34.audioplayer.toolbar.Button", {
  extend: qx.ui.toolbar.Button,

  construct(name){
    const icons = scro34.audioplayer.IconFactory.getInstance();
    const iconDefault = icons.getIcon(name);
    super(null, iconDefault);

    const hoverName = name + "_HOVER";
    let iconHovered = iconDefault;
    if (icons.hasCustomIcon(hoverName)){
      iconHovered = icons.getIcon(hoverName);
    }

    this._iconDefault = iconDefault;
    this._iconHovered = iconHovered;

    this.addListener("pointerover", () => this.setIcon(this._iconHovered));
    this.addListener("pointerout", () => this.setIcon(this._iconDefault));
  }
});
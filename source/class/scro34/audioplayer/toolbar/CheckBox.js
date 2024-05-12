/* ************************************************************************

   Copyright:
     2015 Norbert Schröder, http://scro34.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Norbert Schröder (scro34)

************************************************************************ */

qx.Class.define("scro34.audioplayer.toolbar.CheckBox", {
  extend: qx.ui.toolbar.CheckBox,

  construct(name, namePressed){
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

    let iconPressedDefault = iconDefault;
    iconPressedDefault = icons.getIcon(namePressed);

    const hoverPressedName = namePressed + "_HOVER";
    let iconPressedHovered = iconPressedDefault;
    if (icons.hasCustomIcon(hoverPressedName)){
      iconPressedHovered = icons.getIcon(hoverPressedName);
    }

    this._iconPressedDefault = iconPressedDefault;
    this._iconPressedHovered = iconPressedHovered;

    this.addListener("pointerover", () => {
      this.setIcon(this.getValue() ? this._iconPressedHovered : this._iconHovered);
    });

    this.addListener("pointerout", () => {
      this.setIcon(this.getValue() ? this._iconPressedDefault : this._iconDefault);
    });
  },

  members: {
    play(){
      this.setIcon(this._iconPressedDefault);
    },

    pause(){
      this.setIcon(this._iconDefault);
    }
  }
});
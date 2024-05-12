/* ************************************************************************

   Copyright:
     2024 Dmitrii Zolotov

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dmitrii Zolotov (goldim)

************************************************************************ */

qx.Class.define("scro34.audioplayer.IconFactory", {
    extend: qx.core.Object,
    type: "singleton",
  
    construct(){
      this.__defaultIcons = new scro34.audioplayer.Icons();
    },
  
    members: {
      __customIcons: null,
  
      getIcon(name){
        if (this.__customIcons){
          const icon = this.__customIcons.getIcon(name);
          if (icon){
            return icon;
          }
        }
        return this.__defaultIcons.getIcon(name);
      },
  
      hasCustomIcon(name){
        return this.__customIcons && this.__customIcons.getIcon(name);
      },
  
      setCustomIcons(icons){
        this.__customIcons = icons;
      }
    }
});
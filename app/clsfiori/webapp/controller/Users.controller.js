sap.ui.define([
     // "sap/ui/core/mvc/Controller"
    "./BaseController"
  ], (BaseController) => {
    "use strict";
  
    return BaseController.extend("com.app.clsfiori.controller.Users", {
        onInit() {
        },
        onBackBtnPress: function(){
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteBooks");
        }
    });
  });

  
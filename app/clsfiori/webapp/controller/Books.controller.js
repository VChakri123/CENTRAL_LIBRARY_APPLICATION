sap.ui.define([
    //"sap/ui/core/mvc/Controller"
    "./BaseController"
], (BaseController) => {
    "use strict";

    return BaseController.extend("com.app.clsfiori.controller.Books", {
        onInit() {
            // this.getView().setModel(oLocalModel, "localModel");
            // this.getOwnerComponent().getRouter().attachRoutePatternMatched(this.onBooksListLoad, this);
        },
        //After Adding the Book it will be Fetched in the books...
        // onBooksListLoad: function () {
        //     this.getView().byId("idBooksTable").getBinding("items").refresh();
        // },

        onUsersPress: function(){
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteUsers")
        }



    });
});
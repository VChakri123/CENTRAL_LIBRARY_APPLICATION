sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
], (BaseController, Fragment) => {
    "use strict";

    return BaseController.extend("com.app.clsfiori.controller.BaseController", {
        onInit() {
        },
        loadFragment: async function (sFragmentName) {
            const oFragment = await Fragment.load({
                id: this.getView().getId(),
                name: `com.app.clsfiori.fragments.${sFragmentName}`,
                controller: this
            });
            this.getView().addDependent(oFragment);
            return oFragment
        },
        createData: async function (oModel, oPayload, sPath) {
            return new Promise((resolve, reject) => {
                oModel.create(sPath, oPayload, {
                    refreshAfterChange: true,
                    success: function (oSuccessData) {
                        resolve(oSuccessData);
                    },
                    error: function (oErrorData) {
                        reject(oErrorData)
                    }
                })
            })
        },
    });
});













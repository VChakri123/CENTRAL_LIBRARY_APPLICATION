sap.ui.define([
    //"sap/ui/core/mvc/Controller"
    "./BaseController",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], (Controller, ODataModel, Filter, FilterOperator, MessageToast, MessageBox, JSONModel) => {
    "use strict";

    return Controller.extend("com.app.clsfiori.controller.Home", {
        onInit() {
            var oModel = new ODataModel("/odata/v2/LibrarySystemSRV/");
            this.getView().setModel(oModel);
        },

        //LOGIN BUTTON
        onLoginDialogPress: async function () {
            if (!this.onPressLoginDialog) {
                this.onPressLoginDialog = await this.loadFragment("LoginDailog");
            }
            this.onPressLoginDialog.open();
        },
        onLoginPress: function () {
            debugger
            // const oRouter = this.getOwnerComponent().getRouter();
            // oRouter.navTo("RouteBooks")
            // const oView = this.getView();
            const oModel = this.getView().getModel("ModelV2");
            var oUsername = this.byId("idUsernameInput").getValue();
            var oPassword = this.byId("idPasswordInput").getValue();

            var aFilters = [
                new Filter("Username", FilterOperator.EQ, oUsername),
                new Filter("Password", FilterOperator.EQ, oPassword),
            ];

            //READ FUNCTION
            oModel.read("/users", {
                filters: aFilters,
                success: function (oData) {
                    if (oData.results.length > 0) {
                        var oUser = oData.results[0];
                        var userid = oUser.ID;
                        MessageToast.show("Login successful!");

                        if (oUser.userType === "admin") {
                            this.getOwnerComponent().getRouter().navTo("RouteBooks", { ID: userid });
                        } else if (oUser.userType === "member") {
                            this.getOwnerComponent().getRouter().navTo("RouteSingleUserPage", { ID: userid })
                        }
                        this.onCloseLoginDialog();
                    } else {
                        MessageToast.show("Invalid username or password.");
                    }
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Error during login process.");
                }
            });
        },
        onCloseLoginPress: function () {
            this.onPressLoginDialog.close();
        },

        //SIGNUP BUTTON
        onSignUpUserPress: async function () {
            if (!this.onSubmitYourDetailsDailog) {
                this.onSubmitYourDetailsDailog = await this.loadFragment("SignUp");
            }
            this.onSubmitYourDetailsDailog.open();
        },

        onPressSubmitYourDetils: async function () {
            var oView = this.getView();
            var oModel = oView.getModel("ModelV2");
         
            // Retrieve input values
            var oName = this.byId("idInputName_SignUp").getValue().trim();
            var oUserEmail = this.byId("idInputUserEmail_SignUp").getValue().trim();
            var oUserPhoneNumber = this.byId("idInputUserPhoneNumber_SignUp").getValue().trim();
            var oUserName = this.byId("idInputUsername_SignUp").getValue().trim();
            var oUserPassword = this.byId("idInputUserapassword_SignUp").getValue().trim();
            var oUserType = this.byId("idInputUserOrAdmin_SignUp").getSelectedKey();
         
            // Validation checks
            if (!oName || !oUserEmail || !oUserPhoneNumber || !oUserName || !oUserPassword || !oUserType) {
                sap.m.MessageBox.error("Please fill out all required fields!");
                return;
            }
         
            let bValid = true;
         
            if (oName.length < 3) {
                this.byId("idInputName_SignUp").setValueState("Error").setValueStateText("Name must contain at least 3 characters.");
                bValid = false;
            } else {
                this.byId("idInputName_SignUp").setValueState("None");
            }
         
            if (oUserPassword.length < 4) {
                this.byId("idInputUserapassword_SignUp").setValueState("Error").setValueStateText("Password must contain at least 4 characters.");
                bValid = false;
            } else {
                this.byId("idInputUserapassword_SignUp").setValueState("None");
            }
         
            if (!/^\d{10}$/.test(oUserPhoneNumber)) {
                this.byId("idInputUserPhoneNumber_SignUp").setValueState("Error").setValueStateText("Phone number must be a 10-digit number.");
                bValid = false;
            } else {
                this.byId("idInputUserPhoneNumber_SignUp").setValueState("None");
            }
         
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(oUserEmail)) {
                this.byId("idInputUserEmail_SignUp").setValueState("Error").setValueStateText("Email should follow the format 'example@domain.com'.");
                bValid = false;
            } else {
                this.byId("idInputUserEmail_SignUp").setValueState("None");
            }
         
            if (!bValid) {
                sap.m.MessageBox.error("Please correct the highlighted fields.");
                return;
            }
         
            // Check if Username or Phone Number already exists
            const aFilters = [
                new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("Username", sap.ui.model.FilterOperator.EQ, oUserName),
                        new sap.ui.model.Filter("phonenumber", sap.ui.model.FilterOperator.EQ, oUserPhoneNumber),
                    ],
                    and: false,
                }),
            ];
         
            try {
                const bExists = await this.checkIfExists(oModel, "/users", aFilters);
                if (bExists) {
                    sap.m.MessageBox.error("Username or Phone number already exists.");
                    return;
                }
         
                // Prepare payload
                const oPayload = {
                    Name: oName,
                    Email: oUserEmail,
                    phonenumber: oUserPhoneNumber,
                    Username: oUserName,
                    Password: oUserPassword,
                    userType: oUserType,
                };
         
                // Create data
                await this.createData(oModel, oPayload, "/users");
         
                // Clear input fields
                this.byId("idInputName_SignUp").setValue("").setValueState("None");
                this.byId("idInputUserEmail_SignUp").setValue("").setValueState("None");
                this.byId("idInputUserPhoneNumber_SignUp").setValue("").setValueState("None");
                this.byId("idInputUsername_SignUp").setValue("").setValueState("None");
                this.byId("idInputUserapassword_SignUp").setValue("").setValueState("None");
                this.byId("idInputUserOrAdmin_SignUp").setSelectedKey("");
         
                // Close dialog and show success message or error message
                this.onSubmitYourDetailsDailog.close();
                sap.m.MessageToast.show("Your details have been registered successfully.");
            } catch (error) {
                sap.m.MessageBox.error("Error during registration: " + error.message);
                console.error("Error: ", error);
            }
        },
         
        checkIfExists: async function (oModel, sEntitySet, aFilters) {
            return new Promise((resolve, reject) => {
                oModel.read(sEntitySet, {
                    filters: aFilters,
                    success: (oData) => resolve(oData.results.length > 0),
                    error: reject,
                });
            });
        },

        //SIGNUP FRAGMENT CANCEL BUTTON
        onPressCancelSignUpDetails: function () {
            this.onSubmitYourDetailsDailog.close();
        }

    });
});
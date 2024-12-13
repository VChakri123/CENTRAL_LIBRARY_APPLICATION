sap.ui.define([
    "./BaseController",
    //"sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Token",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, Filter, FilterOperator, Token, MessageBox, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("com.app.clsfiori.controller.Books", {
        onInit: function () {
            const oView = this.getView();
            const oMulti1 = oView.byId("idAuthorFilterValue");
            const oMulti2 = oView.byId("idTitleFilterValue");
            const oMulti3 = oView.byId("idISBNFilterValue");

            let validate = function (arg) {
                if (true) {
                    var text = arg.text;
                    return new Token({ key: text, text: text });
                }
            };
            oMulti1.addValidator(validate);
            oMulti2.addValidator(validate);
            oMulti3.addValidator(validate);

            //For Adding into Books Table...
            const oLocalModel = new JSONModel({
                Title: "",
                Author: "",
                ISBN: "",
                Language: "",
                Quantity: "",
                Availability: ""
            });
            this.getView().setModel(oLocalModel, "localModel");
            this.getOwnerComponent().getRouter().attachRoutePatternMatched(this.onBooksListLoad, this);
        },


        //button for popup when opens a CreateBookDialog...
        onCreateBtnPress: async function () {
            if (!this.oCreateBookDialog) {
                this.oCreateBookDialog = await this.loadFragment("CreateBookDialog")
            }
            this.oCreateBookDialog.open()
        },

        //for closing CreateBookDialog...
        onCloseCreateBookDialog: function () {
            if (this.oCreateBookDialog.isOpen()) {
                this.oCreateBookDialog.close()
            }
        },
        //For adding A new Book To the Library...
        onCreateBook: async function () {
            debugger
            const oPayload = this.getView().getModel("localModel").getProperty("/"),
                oModel = this.getView().getModel("ModelV2");

            // Validate required fields
            if (!oPayload.Title || !oPayload.Author || !oPayload.ISBN || !oPayload.Language || !oPayload.Quantity) {
                MessageBox.error("Please enter all required fields.");
                return;
            }

            let bValid = true;

            if (oPayload.Title.length < 3) {
                this.byId("idTitleInput").setValueState("Error").setValueStateText("Title must contain at least 3 characters.");
                bValid = false;
            } else {
                this.byId("idTitleInput").setValueState("None");
            }

            if (oPayload.Author.length < 3) {
                this.byId("idAuthorInput").setValueState("Error").setValueStateText("Author must contain at least 3 characters.");
                bValid = false;
            } else {
                this.byId("idAuthorInput").setValueState("None");
            }

            if (!/^\d{12}$/.test(oPayload.ISBN)) {
                this.byId("idIsbnInput").setValueState("Error").setValueStateText("ISBN number must be a 12-digit number.");
                bValid = false;
            } else {
                this.byId("idIsbnInput").setValueState("None");
            }

            if (!bValid) {
                sap.m.MessageBox.error("Please correct the highlighted fields.");
                return;
            }

            // Check if the book already exists in the library
            const aFilters = [
                new Filter("Title", FilterOperator.EQ, oPayload.Title),
                new Filter("ISBN", FilterOperator.EQ, oPayload.ISBN),
                new Filter("Author", FilterOperator.EQ, oPayload.Author)
            ];

            try {
                const aFilterPromises = aFilters.map(oFilter =>
                    new Promise((resolve, reject) => {
                        oModel.read("/Books", {
                            filters: [oFilter],
                            success: function (oData) {
                                if (oData.results.length > 0) {
                                    resolve(true);
                                } else {
                                    resolve(false);
                                }
                            },
                            error: function (oError) {
                                reject(oError);
                            }
                        });
                    })
                );

                const [bTitleExists, bISBNExists, bAuthorExists] = await Promise.all(aFilterPromises);
                if (bTitleExists || bISBNExists || bAuthorExists) {
                    MessageBox.error("Title, ISBN, or Author already exists in the Library. Please Check it Once...");
                    return;
                }

                // Set availability equal to quantity
                oPayload.Availability = oPayload.Quantity;
                this.getView().getModel("localModel").setData(oPayload);

                // Create the new book
                await this.createData(oModel, oPayload, "/Books");
                this.getView().byId("idBooksTable123").getBinding("items").refresh();
                this.oCreateBookDialog.close();
                MessageBox.success("Book created successfully");
            } catch (error) {
                this.oCreateBookDialog.close();
                MessageBox.error("Some technical issue occurred.");
            }
             // Clear input fields
             this.byId("idTitleInput").setValue("").setValueState("None");
             this.byId("idAuthorInput").setValue("").setValueState("None");
             this.byId("idIsbnInput").setValue("").setValueState("None");
             this.byId("idLanguageInput").setValue("").setValueState("None");
             this.byId("idQuantityInput").setValue("").setValueState("None");
           
        },

        

        

         //For delete the perticular selected book...
         onCheckDelete: function (oEvent) {
            //MessageToast.show("Book updated successfully");
            var oSelected = this.byId("idBooksTable123").getSelectedItem();
            if (oSelected) {
                var oBookName = oSelected.getBindingContext().getObject().title;
                oSelected.getBindingContext().delete("$auto").then(function () {
                    MessageToast.show("Selected Book SuccessFully Deleted..!");
                },
                    function (oError) {
                        MessageToast.show("Deletion Error: ", oError);
                    });
                this.getView().byId("idBooksTable123").getBinding("items").refresh();
            } else {
                MessageToast.show("Please Select a Book to Delete");
            }
        },



        onUsersPress: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteUsers")
        }

    });
});
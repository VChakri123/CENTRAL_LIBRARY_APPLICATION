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
        //After Adding the Book it will be Fetched in the books...
        onBooksListLoad: function () {
            this.getView().byId("idBooksTable123").getBinding("items").refresh();
        },



        //RETURNED BOOKS BELL ICON POPOVER
        handlePopoverPress: function (oEvent) {
            var oButton = oEvent.getSource(),
                oView = this.getView();

            // create popover
            if (!this._pPopover) {
                this._pPopover = this.loadFragment("ReturnedBooksDialog").then(function (oPopover) {
                    oView.addDependent(oPopover);
                    oPopover.bindElement("");
                    return oPopover;
                });
            }
            this._pPopover.then(function (oPopover) {
                oPopover.openBy(oButton);
            });
        },


        //ACTIVELOANS FRAGMENT OPEN
        onActiveLoansBtnPress: async function () {
            if (!this.oActiveLoansDialog) {
                this.oActiveLoansDialog = await this.loadFragment("ActiveLoansDialog")
            }
            this.oActiveLoansDialog.open()
        },

        //REFRESH FOR ACTIVELOANS 
        onActiveLoansFragRefreshBtn: function () {
            const oView = this.getView();
            oView.byId("idActiveLoanstable123").getBinding("items").refresh();
            MessageToast.show("ActiveLoans table refreshed Succesfully!");
        },

        //DELETE FOR ACTIVELOANS
        onClearLoanPress: function (oEvent) {
            const oItem = oEvent.getSource().getParent();
            const oContext = oItem.getBindingContext();
            const sPath = oContext.getPath();
            const oModel = this.getView().getModel("ModelV2");
            const oBookData = oContext.getObject();
            const oThis = this

            MessageBox.confirm(
                `Are you sure you want to delete the loan for book '${oBookData.book.Title} '?`,
                {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.YES) {
                            debugger
                            oModel.remove(sPath, {
                                success: function () {
                                    MessageBox.success(`Loan for book '${oBookData.book.Title}' deleted successfully.`);
                                    oThis.getView().byId("idActiveLoanstable123").getBinding("items").refresh();
                                },
                                error: function () {
                                    MessageBox.error(`Failed to clear loan for book '${oBookData.book.Title}'.`);
                                }
                            });
                        }
                    }
                }
            );
        },
        //CLOSING ACTIVELOANS FRAGMENT
        onCloseActiveLoans: function () {
            if (this.oActiveLoansDialog) {
                this.oActiveLoansDialog.close();
            }
        },


        //SEARCH EVENT FOR TITLE
        onLiveSearchBooksTableTitle: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");

            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter("Title", FilterOperator.Contains, sQuery));
            }

            // Apply the filter to the table binding
            this.getView().byId("idBooksTable123").getBinding("items").filter(aFilters);
        },
        //SEARCH EVENT FOR AUTHOR
        onLiveSearchBooksTableAuthor: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");

            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter("Author", FilterOperator.Contains, sQuery));
            }

            // Apply the filter to the table binding
            this.getView().byId("idBooksTable123").getBinding("items").filter(aFilters);
        },
        //SEARCH EVENT FOR ISBN
        onLiveSearchBooksTableISBN: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");

            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter("ISBN", FilterOperator.Contains, sQuery));
            }

            // Apply the filter to the table binding
            this.getView().byId("idBooksTable123").getBinding("items").filter(aFilters);
        },


        //REFRESH THE BOOKS TABLE
        onBooksRefreshBtn: function () {
            const oView = this.getView();
            const oTable = oView.byId("idBooksTable123");
            // Refresh the table binding
            oTable.getBinding("items").refresh();
            // Clear table selection
            const oTableSelectionModel = oTable.getSelectedContexts(); // Check if it's multi-select or single-select
            if (oTableSelectionModel.length > 0) {
                oTable.removeSelections(true);
            }
            // Show a message toast
            MessageToast.show("Books table refreshed successfully and selections cleared!");
        },

        // onBooksRefreshBtn: function () {
        //     const oView = this.getView();
        //     oView.byId("idBooksTable123").getBinding("items").refresh();
        //     MessageToast.show("Books table refreshed Succesfully!");
        // },



        //ISSUEBOOKS FRAGMENT OPEN
        onIssueBooksBtnPress: async function () {
            if (!this.oIssueBooksDialog) {
                this.oIssueBooksDialog = await this.loadFragment("IssueBooksDialog")
            }
            this.oIssueBooksDialog.open()
        },

        //REFRESH for Issue Books
        onIssueBooksRefreshBtn: function () {
            const oView = this.getView();
            const oTable = oView.byId("idIssueBooksTable");
            // Refresh the table binding
            oTable.getBinding("items").refresh();
            // Clear table selection
            const oTableSelectionModel = oTable.getSelectedContexts(); // Check if it's multi-select or single-select
            if (oTableSelectionModel.length > 0) {
                oTable.removeSelections(true);
            }
            // Show a message toast
            MessageToast.show("Books table refreshed successfully!");
        },

        // onIssueBooksRefreshBtn: function () {
        //     const oView = this.getView();
        //     oView.byId("idIssueBooksTable").getBinding("items").refresh();
        //     MessageToast.show("Issue Books table refreshed Succesfully!");
        // },

        //ISSUEBOOKS ACCEPT BUTTON FRAGMENT
        onAcceptButtonIssueBookPress: async function () {
            debugger
            if (this.byId("idIssueBooksTable").getSelectedItems().length === 0) {
                MessageToast.show("Please Select at least one Book to Issue..!");
                return;
            }

            if (this.byId("idIssueBooksTable").getSelectedItems().length > 1) {
                MessageToast.show("Please Select only One Book to Issue..!");
                return;
            }
            var oSelectedBookData = this.getView().byId("idIssueBooksTable").getSelectedItem().getBindingContext().getObject();
            const oModel = this.getView().getModel("ModelV2");
            const aFilters = [
                new Filter("user_ID", FilterOperator.EQ, oSelectedBookData.user12.ID),
                new Filter("book_ID", FilterOperator.EQ, oSelectedBookData.Book12.ID)
            ];

            const oExistingLoan = await new Promise((resolve, reject) => {
                oModel.read("/BookLoans", {
                    filters: aFilters,
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
            });

            if (oExistingLoan) {
                MessageToast.show("You already have this Book..! Please check it once.");
                return;
            }
            var oAvailability = parseInt(oSelectedBookData.Book12.Availability) - 1;
            const userModel = new sap.ui.model.json.JSONModel({
                user_ID: oSelectedBookData.user12.ID,
                book_ID: oSelectedBookData.Book12.ID,
                IssueDate: new Date(),
                ReturnDate: new Date(),

            });
            this.getView().setModel(userModel, "userModel");
            const oPayload = this.getView().getModel("userModel").getProperty("/");
            try {
                await this.createData(oModel, oPayload, "/BookLoans");
                MessageBox.success("Book issued successfully.");
                // this.oIssueBooksDialog.close();
                this.byId("idIssueTable").close();
                this.getView().byId("idIssueBooksTable").getBinding("items").refresh();
            } catch (error) {
                MessageBox.error("Some technical issue occurred...");
            }
            // Clear table selections and refresh the table data
            const oTable = this.byId("idIssueBooksTable");
            oTable.removeSelections(true); // Clear any selections
            oTable.getBinding("items").refresh(); // Refresh the table binding
            // MessageToast.show("Table refreshed successfully!");
        },

        //CLOSING ISSUEBOOKS FRAGMENT
        onCancleIssueBookPress: function () {
            if (this.oIssueBooksDialog) {
                this.oIssueBooksDialog.close();
            }
        },


        //Button for popup when opens a CreateBookDialog...
        onCreateBtnPress: async function () {
            if (!this.oCreateBookDialog) {
                this.oCreateBookDialog = await this.loadFragment("CreateBookDialog")
            }
            this.oCreateBookDialog.open()
        },

        //CREATE BOOK(For adding A new Book To the Library...)
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
        //For closing CreateBookDialog...
        onCloseCreateBookDialog: function () {
            if (this.oCreateBookDialog.isOpen()) {
                this.oCreateBookDialog.close()
            }
        },


        //DELETE SELECTED BOOK
        onCheckDelete: function (oEvent) {
            debugger
            var oSelected = this.byId("idBooksTable123").getSelectedItem();
            if (oSelected) {
                var oBookName = oSelected.getBindingContext().getObject().Title;

                // Show a confirmation message box
                sap.m.MessageBox.confirm(
                    "Are you sure you want to delete the book: " + oBookName + " ?", {
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.OK) {
                            // Proceed with deletion
                            oSelected.getBindingContext().delete("$auto").then(function () {
                                sap.m.MessageToast.show("Selected Book Successfully Deleted!");
                            }, function (oError) {
                                sap.m.MessageToast.show("Deletion Error: " + oError.message);
                            });
                            this.getView().byId("idBooksTable123").getBinding("items").refresh();
                        }
                    }.bind(this) // Bind this to maintain context
                }
                );
            } else {
                sap.m.MessageToast.show("Please select a book to delete.");
            }
        },


        //UPDATE SELECTED BOOK
        onEditBooksBtnPress: async function () {

            var oSelected = this.byId("idBooksTable123").getSelectedItem();
            if (oSelected) {
                debugger
                var oID = oSelected.getBindingContext().getObject().ID
                var oBookname = oSelected.getBindingContext().getObject().Title
                var oAuthorName = oSelected.getBindingContext().getObject().Author
                var oQuantity = oSelected.getBindingContext().getObject().Quantity
                var oAvailability = oSelected.getBindingContext().getObject().Availability
                var oLanguage = oSelected.getBindingContext().getObject().Language
                var oISBN = oSelected.getBindingContext().getObject().ISBN

                const oNewBookModel = new JSONModel({
                    ID: oID,
                    Title: oBookname,
                    Author: oAuthorName,
                    ISBN: oISBN,
                    Language: oLanguage,
                    Quantity: oQuantity,
                    Availability: oAvailability,
                });
                this.getView().setModel(oNewBookModel, "oNewBookModel");
                if (!this.oUpdateBooksDialog) {
                    this.oUpdateBooksDialog = await this.loadFragment("UpdateBooksDialog"); // Load your fragment asynchronously
                }
                this.oUpdateBooksDialog.open();
            } else {
                MessageToast.show("Please select a Book to Edit..!");
            }
        },
        onUpdateBooksPress_EditBook: function () {
            debugger
            var oView = this.getView();
            var SelectedData = this.getView().byId("idBooksTable123").getSelectedItem();
            var objects = SelectedData.getBindingContext().getObject();
            const oPayload = this.getView().getModel("oNewBookModel").getData();
            var oDataModel = this.getOwnerComponent().getModel("ModelV2");
            const newQuantity = parseInt(oPayload.Quantity);
            const pastQuantity = parseInt(objects.Quantity);
            const pastAvailability = parseInt(oPayload.Availability); // Previous availability

            // Fetch the new quantity (ensure the input field or binding provides it)
            if (newQuantity === 0 || !newQuantity) {
                sap.m.MessageBox.error("Quantity is Invalid!");
                return;
            }

            // Adjust availability based on the quantity change
            let newAvailability = pastAvailability;
            if (newQuantity > pastQuantity) {
                newAvailability += newQuantity - pastQuantity; // Increase availability
            } else if (newQuantity < pastQuantity) {
                const diff = pastQuantity - newQuantity;
                newAvailability = Math.max(0, pastAvailability - diff); // Ensure availability doesn't go below zero
            }

            // Update the payload with the new values
            oPayload.Quantity = newQuantity;
            oPayload.Availability = String(newAvailability);


            try {
                // Assuming your update method is provided by your OData V2 model
                oDataModel.update("/Books(" + oPayload.ID + ")", oPayload, {
                    success: function () {
                        this.getView().byId("idBooksTable123").getBinding("items").refresh();
                        MessageToast.show("Book details are updated.");
                        this.oUpdateBooksDialog.close();
                    }.bind(this),
                    error: function (oError) {
                        this.oUpdateBooksDialog.close();
                        sap.m.MessageBox.error("Failed to update book: " + oError.message);
                    }.bind(this)
                });
            } catch (error) {
                this.oUpdateBooksDialog.close();
                sap.m.MessageBox.error("Some technical Issue");
            }
        },
        //FOR CLOSING UPDATE BOOKS
        onCloseUpdateBooksDialog: function () {
            if (this.oUpdateBooksDialog) {
                this.oUpdateBooksDialog.close();
            }
        },


        // //SEARCH FOR BOOKS
        // onLiveSearchBooksTable: function (oEvent) {
        //     var sQuery = oEvent.getParameter("newValue");

        //     var aFilters = [];

        //     if (sQuery && sQuery.length > 0) {
        //         aFilters.push(new Filter("Title", FilterOperator.Contains, sQuery));
        //         aFilters.push(new Filter("Author", FilterOperator.Contains, sQuery));
        //         aFilters.push(new Filter("ISBN", FilterOperator.Contains, sQuery));
        //         aFilters.push(new Filter("Language", FilterOperator.Contains, sQuery));


        //         var oFinalFilter = new Filter({
        //             filters: aFilters,
        //             and: false
        //         });

        //         this.getView().byId("idBooksTable123").getBinding("items").filter(oFinalFilter);
        //     } else {
        //         this.getView().byId("idBooksTable123").getBinding("items").filter([]);
        //     }
        // },


        //USER BUTTON PRESS
        onUsersPress: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteUsers")
        },


        //LOGOUT BUTTON
        onBackBtnPress: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteHome", {}, true)
        }


    });
});